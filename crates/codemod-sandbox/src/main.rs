use ast_grep::wasm_lang::WasmLang;
use rquickjs::{
    async_with,
    loader::{BuiltinLoader, BuiltinResolver, ModuleLoader},
    CatchResultExt,
};
use thiserror::Error;
use wasm_bindgen::prelude::*;

mod ast_grep;
mod capabilities;
mod plugins;

use capabilities::CapabilitiesModule;
use web_tree_sitter_sg::TreeSitter;

#[derive(Debug, Error)]
enum Error {
    #[error("Value could not be stringified to JSON")]
    NotStringifiable,

    #[error("A QuickJS error occured: {0}")]
    QuickJS(#[from] rquickjs::Error),

    #[error("Error loading module: {0}")]
    Loading(String),

    #[error("Error evaluating module: {0}")]
    Evaluating(String),

    #[error("Error getting default export: {0}")]
    GettingDefaultExport(String),

    #[error("Error getting `default` function: {0}")]
    GettintDefaultFunction(String),

    #[error("Error parsing input values: {0}")]
    ParsingInputValues(String),

    #[error("{0}")]
    CallingModuleFunction(String),
}

type Result<T> = std::result::Result<T, Error>;

#[wasm_bindgen(js_name = initializeTreeSitter)]
pub async fn initialize_tree_sitter() -> std::result::Result<(), JsError> {
    TreeSitter::init().await
}

#[wasm_bindgen(js_name = setupParser)]
pub async fn setup_parser(
    lang_name: String,
    parser_path: String,
) -> std::result::Result<(), JsError> {
    WasmLang::set_current(&lang_name, &parser_path).await
}

#[wasm_bindgen]
pub fn eval_code(code: String) -> std::result::Result<String, JsError> {
    let rt = rquickjs::Runtime::new()?;
    let ctx = rquickjs::Context::full(&rt)?;
    let result: Result<String> = ctx.with(|ctx| {
        let result_obj: rquickjs::Value = ctx.eval(code.as_str())?;
        let Some(result_str) = ctx.json_stringify(result_obj)? else {
            return Err(Error::NotStringifiable);
        };
        Ok(result_str.to_string()?)
    });
    Ok(result?)
}

async fn maybe_promise<'js>(
    result_obj: rquickjs::Value<'js>,
) -> rquickjs::Result<rquickjs::Value<'js>> {
    let resolved_obj: rquickjs::Value = if result_obj.is_promise() {
        let promise = result_obj.as_promise().unwrap().clone();
        let ctx = result_obj.ctx();
        while ctx.execute_pending_job() {}
        let result = promise.into_future::<rquickjs::Value<'js>>().await?;
        result
    } else {
        result_obj.clone()
    };
    Ok(resolved_obj)
}

macro_rules! add_capability_modules {
    ($resolver:expr, $loader:expr, $module_name:expr, $invocation_id:expr, $($capability:expr),+ $(,)?) => {
        $(
            $loader.add_module(
                concat!("@", $capability),
                format!(
                    "import {{ {} }} from \"{}\";\nexport default function(inputs) {{ return {}(\"{}\", inputs); }}\n",
                    $capability,
                    $module_name,
                    $capability,
                    $invocation_id
                )
            );
            $resolver.add_module(concat!("@", $capability));
        )+
    };
}

#[wasm_bindgen]
pub async fn run_module(
    invocation_id: String,
    method: String,
    name: String,
    modules: JsValue,
    code: String,
    json: String,
) -> std::result::Result<String, JsError> {
    let mut resolver = BuiltinResolver::default();

    let capability_module_name = format!("bb-{}", invocation_id);

    let mut capabilities_loader = BuiltinLoader::default();
    add_capability_modules!(
        resolver,
        capabilities_loader,
        capability_module_name,
        invocation_id,
        "fetch",
        "invoke",
        "secrets",
        "output",
        "describe",
        "query",
        "read",
        "write",
        "blob",
    );

    let mut peer_loader = BuiltinLoader::default();
    let object = js_sys::Object::from(modules);
    let entries = js_sys::Object::entries(&object);
    for i in 0..entries.length() {
        let entry = js_sys::Array::from(&entries.get(i));
        let peer = entry.get(0).as_string().unwrap_or_default();
        let code = entry.get(1).as_string().unwrap_or_default();
        if !peer.is_empty() && !code.is_empty() && name != peer {
            let peer_js = format!("{}.js", peer);
            peer_loader.add_module(&peer, code.as_str());
            resolver.add_module(&peer);
            peer_loader.add_module(&peer_js, code.as_str());
            resolver.add_module(&peer_js);
        }
    }
    resolver.add_module(capability_module_name.clone());

    // Register ast_grep module
    resolver.add_module("ast-grep");

    let loader = (
        capabilities_loader,
        peer_loader,
        ModuleLoader::default()
            .with_module(capability_module_name.clone(), CapabilitiesModule)
            .with_module("ast-grep", ast_grep::AstGrepModule),
    );

    let rt = rquickjs::AsyncRuntime::new()?;
    let ctx = rquickjs::AsyncContext::full(&rt).await?;

    ctx.with(|ctx| plugins::console::init(&ctx)).await?;
    ctx.with(|ctx| plugins::atob::init(&ctx)).await?;

    rt.set_loader(resolver, loader).await;

    let result = async_with!(ctx => |ctx| {

        // Load the module.
        let module = rquickjs::Module::declare(ctx.clone(), name, code)
            .catch(&ctx)
            .map_err(|e| Error::Loading(e.to_string()))?;

        // Evaluate module.
        let (evaluated, _) = module
            .eval()
            .catch(&ctx)
            .map_err(|e| Error::Evaluating(e.to_string()))?;
        while ctx.execute_pending_job() {}

        // Get the default export.
        let namespace = evaluated
            .namespace()
            .catch(&ctx)
            .map_err(|e| Error::GettingDefaultExport(e.to_string()))?;

        let func = namespace
            .get::<_, rquickjs::Function>(method)
            .catch(&ctx)
            .map_err(|e| Error::GettintDefaultFunction(e.to_string()))?;

        let inputs = ctx
            .json_parse(json)
            .catch(&ctx)
            .map_err(|e| Error::ParsingInputValues(e.to_string()))?;

        // Call it and return value.
        let result_obj: rquickjs::Value = maybe_promise(
            func.call((inputs,)).catch(&ctx)
            .map_err(|e| Error::CallingModuleFunction(e.to_string()))?
        ).await.catch(&ctx)
        .map_err(|e| Error::CallingModuleFunction(e.to_string()))?;

        let Some(result_str) = ctx.json_stringify(result_obj)? else {
            return Err(Error::NotStringifiable);
        };
        Ok(result_str.to_string()?)
    })
    .await;

    rt.idle().await;

    Ok(result?)
}

#[wasm_bindgen(main)]
pub fn main() {}
