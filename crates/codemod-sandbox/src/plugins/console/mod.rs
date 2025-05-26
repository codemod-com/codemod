use rquickjs::Ctx;
use rquickjs::Result;
use wasm_bindgen::{prelude::*, JsValue};

pub fn init(ctx: &Ctx<'_>) -> Result<()> {
    use rquickjs::{function::Func, Object};
    let globals = ctx.globals();

    let console = Object::new(ctx.clone())?;

    console.set("log", Func::from(console_log))?;
    console.set("error", Func::from(console_error))?;
    console.set("warn", Func::from(console_warn))?;

    globals.set("console", console)?;

    Ok(())
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console, js_name = log, variadic)]
    fn host_log(items: Vec<JsValue>);
    #[wasm_bindgen(js_namespace = console, js_name = warn, variadic)]
    fn host_warn(items: Vec<JsValue>);
    #[wasm_bindgen(js_namespace = console, js_name = error, variadic)]
    fn host_error(items: Vec<JsValue>);
}

fn console_log(items: rquickjs::function::Rest<rquickjs::Value>) {
    let items = convert_from_qj_to_host(items);
    host_log(items);
}

fn console_warn(items: rquickjs::function::Rest<rquickjs::Value>) {
    let items = convert_from_qj_to_host(items);
    host_warn(items);
}

fn console_error(items: rquickjs::function::Rest<rquickjs::Value>) {
    let items = convert_from_qj_to_host(items);
    host_error(items);
}

fn convert_from_qj_to_host(items: rquickjs::prelude::Rest<rquickjs::Value<'_>>) -> Vec<JsValue> {
    let items: Vec<_> = items
        .0
        .into_iter()
        .map(|item| -> Option<JsValue> {
            let ctx = item.ctx();
            let s = ctx.json_stringify(&item).ok()??;
            let s = s.to_string().ok()?;
            js_sys::JSON::parse(&s).ok()
        })
        .map(|v| v.unwrap_or_else(|| JsValue::from_str("<Unrepresentable value>")))
        .collect();
    items
}
