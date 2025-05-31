use rquickjs::{Type, Value};
use wasm_bindgen::{JsError, JsValue};

pub fn quickjs_value_to_jsvalue(value: Value<'_>) -> Result<JsValue, JsError> {
    match value.type_of() {
        Type::Undefined => Ok(JsValue::undefined()),
        Type::Null => Ok(JsValue::null()),
        Type::Bool => Ok(JsValue::from_bool(value.as_bool().unwrap_or_default())),
        Type::Int => Ok(JsValue::from_f64(value.as_int().unwrap_or_default() as f64)),
        Type::Float => Ok(JsValue::from_f64(value.as_float().unwrap_or_default())),
        Type::String => {
            if let Some(s) = value.as_string() {
                if let Ok(s_str) = s.to_string() {
                    Ok(JsValue::from_str(&s_str))
                } else {
                    Ok(JsValue::from_str(""))
                }
            } else {
                Ok(JsValue::from_str(""))
            }
        }
        Type::Array => {
            let array = value.as_array().unwrap();
            let js_array = js_sys::Array::new();
            for i in 0..array.len() {
                if let Ok(item) = array.get::<Value>(i) {
                    js_array.push(&quickjs_value_to_jsvalue(item)?);
                }
            }
            Ok(JsValue::from(js_array))
        }
        Type::Object => {
            let object = value.as_object().unwrap();
            let js_object = js_sys::Object::new();
            for prop in object.props::<String, Value>() {
                if let Ok((key, val)) = prop {
                    let _ = js_sys::Reflect::set(
                        &js_object,
                        &JsValue::from_str(&key),
                        &quickjs_value_to_jsvalue(val)?,
                    );
                }
            }
            Ok(JsValue::from(js_object))
        }
        Type::Exception => {
            let exception = value.as_exception().unwrap();
            let message = exception.message().unwrap_or_default();
            Err(JsError::new(&message))
        }
        _ => Ok(JsValue::undefined()),
    }
}
