// #[cfg(feature = "wasm")]
// use crate::ast_grep::wasm_lang::WasmLang as SupportLang;
use crate::rquickjs_compat::{Ctx, Exception, FromJs, Result, Value};
use ast_grep_config::{DeserializeEnv, RuleCore, SerializableRuleCore};
use ast_grep_core::{matcher::KindMatcher, Pattern};
#[cfg(not(feature = "wasm"))]
use ast_grep_dynamic::DynamicLang;

use super::serde::JsValue;

#[allow(clippy::large_enum_variant)]
pub enum JsMatcherRjs {
    Pattern(Pattern),
    Kind(KindMatcher),
    Config(RuleCore),
}

// Convert a JavaScript value to an appropriate ast-grep matcher
pub fn convert_matcher<'js>(
    value: Value<'js>,
    lang: DynamicLang,
    ctx: &Ctx<'js>,
) -> Result<JsMatcherRjs> {
    if value.is_string() {
        let pattern_str = value.as_string().unwrap().to_string()?;
        let pattern = Pattern::new(&pattern_str, lang);
        return Ok(JsMatcherRjs::Pattern(pattern));
    } else if value.is_number() {
        let kind_id = value.as_number().unwrap() as u16;
        let kind_matcher = KindMatcher::from_id(kind_id);
        return Ok(JsMatcherRjs::Kind(kind_matcher));
    } else if value.is_object() {
        let js_value = JsValue::from_js(ctx, value)?;
        let serde_value: SerializableRuleCore = serde_json::from_value(js_value.0)
            .map_err(|e| Exception::throw_type(ctx, &e.to_string()))?;
        let env = DeserializeEnv::new(lang);
        let config = serde_value
            .get_matcher(env)
            .map_err(|e| Exception::throw_type(ctx, &e.to_string()))?;
        return Ok(JsMatcherRjs::Config(config));
    }

    Err(Exception::throw_type(
        ctx,
        "Matcher must be an object with a 'pattern' or 'kind' property",
    ))
}
