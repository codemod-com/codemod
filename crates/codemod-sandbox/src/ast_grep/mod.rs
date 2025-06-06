mod sg_node;
mod types;
mod utils;

#[cfg(feature = "wasm")]
pub mod wasm_lang;

#[cfg(feature = "wasm")]
pub mod wasm_utils;

#[cfg(not(feature = "wasm"))]
use ast_grep_language::{LanguageExt, SupportLang};

#[cfg(feature = "wasm")]
use ast_grep_core::language::Language;

use crate::rquickjs_compat::module::{Declarations, Exports, ModuleDef};
use crate::rquickjs_compat::{prelude::Func, Class, Ctx, Exception, Object, Result};

use sg_node::{SgNodeRjs, SgRootRjs};

mod serde;

#[allow(dead_code)]
pub struct AstGrepModule;

impl ModuleDef for AstGrepModule {
    fn declare(declare: &Declarations) -> Result<()> {
        declare.declare(stringify!(SgRootRjs))?;
        declare.declare(stringify!(SgNodeRjs))?;
        declare.declare("parse")?;
        declare.declare("parseAsync")?;
        declare.declare("kind")?;
        // TODO: Declare other functions like scanFind, scanFix, dumpASTNodes, dumpPattern
        declare.declare("default")?;
        Ok(())
    }

    fn evaluate<'js>(ctx: &Ctx<'js>, exports: &Exports<'js>) -> Result<()> {
        let default = Object::new(ctx.clone())?;
        Class::<SgRootRjs>::define(&default)?;
        Class::<SgNodeRjs>::define(&default)?;
        default.set("parse", Func::from(parse_rjs))?;
        default.set("parseAsync", Func::from(parse_async_rjs))?;
        default.set("kind", Func::from(kind_rjs))?;
        // TODO: Set other functions
        exports.export("default", default)?;
        Ok(())
    }
}

fn parse_rjs(ctx: Ctx<'_>, lang: String, src: String) -> Result<SgRootRjs> {
    SgRootRjs::try_new(lang, src)
        .map_err(|e| Exception::throw_message(&ctx, &format!("Failed to parse: {}", e)))
}

fn parse_async_rjs(ctx: Ctx<'_>, lang: String, src: String) -> Result<SgRootRjs> {
    #[cfg(feature = "wasm")]
    {
        if !wasm_lang::WasmLang::is_parser_initialized() {
            return Err(Exception::throw_message(&ctx, "Tree-sitter parser not initialized. Ensure setupParser() has completed before calling parseAsync."));
        }
    }

    // Call the same implementation as parse_rjs since the async setup should be done by now
    SgRootRjs::try_new(lang, src)
        .map_err(|e| Exception::throw_message(&ctx, &format!("Failed to parse: {}", e)))
}

// Corresponds to the `kind` function in wasm/lib.rs
// Takes lang: string, kind_name: string -> u16
#[cfg(feature = "wasm")]
fn kind_rjs(ctx: Ctx<'_>, lang: String, kind_name: String) -> Result<u16> {
    use std::str::FromStr;

    use wasm_lang::WasmLang;
    let lang = WasmLang::from_str(&lang)
        .map_err(|e| Exception::throw_message(&ctx, &format!("Language error: {}", e)))?;

    let kind = lang.kind_to_id(&kind_name);
    Ok(kind)
}

#[cfg(not(feature = "wasm"))]
fn kind_rjs(ctx: Ctx<'_>, lang: String, kind_name: String) -> Result<u16> {
    use std::str::FromStr;

    let lang = SupportLang::from_str(&lang)
        .map_err(|e| Exception::throw_message(&ctx, &format!("Language error: {}", e)))?;

    let kind = lang
        .get_ts_language()
        .id_for_node_kind(&kind_name, /* named */ true);

    Ok(kind)
}
