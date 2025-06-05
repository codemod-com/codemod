use crate::rquickjs_compat::{Array, Ctx, FromJs, IntoJs, Object, Type, Value as QValue};

#[derive(Debug)]
pub(crate) struct JsValue(pub serde_json::Value);

impl<'js> FromJs<'js> for JsValue {
    fn from_js(_ctx: &Ctx<'js>, v: QValue<'js>) -> crate::rquickjs_compat::Result<Self> {
        let computed_value = match v.type_of() {
            Type::Uninitialized | Type::Undefined | Type::Null => serde_json::Value::Null,
            Type::Bool => {
                let bool_val: bool = v.get()?;
                serde_json::Value::Bool(bool_val)
            }
            Type::Int => {
                let int_val: i32 = v.get()?;
                serde_json::Value::Number(int_val.into())
            }
            Type::Float => {
                let float_val: f64 = v.get()?;
                match serde_json::Number::from_f64(float_val) {
                    Some(num) => serde_json::Value::Number(num),
                    None => serde_json::Value::Null,
                }
            }
            Type::BigInt => {
                let big_int_val: i64 = v.get()?;
                serde_json::Value::Number(big_int_val.into())
            }
            Type::String => {
                let string_val: String = v.get()?;
                serde_json::Value::String(string_val)
            }
            Type::Array => {
                let mut values = Vec::new();

                if let Some(array) = v.as_array() {
                    for element in array.iter().flatten() {
                        let element_value = Self::from_js(_ctx, element)?.0;
                        values.push(element_value);
                    }
                }

                serde_json::Value::Array(values)
            }
            Type::Object => {
                let mut map = serde_json::Map::new();

                if let Some(obj) = v.as_object() {
                    for key in obj.keys::<String>().flatten() {
                        if let Ok(prop) = obj.get(&key) {
                            let prop_value = Self::from_js(_ctx, prop)?.0;
                            map.insert(key, prop_value);
                        }
                    }
                }

                serde_json::Value::Object(map)
            }
            _ => serde_json::Value::Null,
        };

        Ok(JsValue(computed_value))
    }
}

impl<'js> IntoJs<'js> for JsValue {
    fn into_js(self, ctx: &Ctx<'js>) -> crate::rquickjs_compat::Result<QValue<'js>> {
        match self.0 {
            serde_json::Value::Null => Ok(QValue::new_null(ctx.clone())),
            serde_json::Value::Bool(b) => b.into_js(ctx),
            serde_json::Value::Number(n) => {
                if n.is_i64() {
                    n.as_i64().unwrap().into_js(ctx)
                } else if n.is_u64() {
                    n.as_u64().unwrap().into_js(ctx)
                } else {
                    n.as_f64().unwrap().into_js(ctx)
                }
            }
            serde_json::Value::String(s) => s.into_js(ctx),
            serde_json::Value::Array(arr) => {
                let array = Array::new(ctx.clone())?;

                for (i, val) in arr.into_iter().enumerate() {
                    let js_val = JsValue(val).into_js(ctx)?;
                    array.set(i, js_val)?;
                }

                Ok(array.into_value())
            }
            serde_json::Value::Object(obj) => {
                let obj_val = Object::new(ctx.clone())?;

                for (key, val) in obj {
                    let js_val = JsValue(val).into_js(ctx)?;
                    obj_val.set(&key, js_val)?;
                }

                Ok(obj_val.into_value())
            }
        }
    }
}
