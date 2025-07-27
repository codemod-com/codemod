use crate::rquickjs_compat::{Ctx, Error, FromJs, IntoJs, Object, Result, Value};

use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct JsPosition {
    pub line: usize,
    pub column: usize,
    pub index: usize,
}

impl<'js> FromJs<'js> for JsPosition {
    fn from_js(_ctx: &Ctx<'js>, value: Value<'js>) -> Result<Self> {
        let ty_name = value.type_name();
        let obj = value
            .as_object()
            .ok_or(Error::new_from_js(ty_name, "Object"))?;
        let line = obj.get("line")?;
        let column = obj.get("column")?;
        let index = obj.get("index")?;
        Ok(Self {
            line,
            column,
            index,
        })
    }
}

impl<'js> IntoJs<'js> for JsPosition {
    fn into_js(self, ctx: &Ctx<'js>) -> Result<Value<'js>> {
        let obj = Object::new(ctx.clone())?;
        obj.set("line", self.line)?;
        obj.set("column", self.column)?;
        obj.set("index", self.index)?;
        obj.into_js(ctx)
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct JsNodeRange {
    pub start: JsPosition,
    pub end: JsPosition,
}

impl<'js> FromJs<'js> for JsNodeRange {
    fn from_js(_ctx: &Ctx<'js>, value: Value<'js>) -> Result<Self> {
        let obj = value
            .as_object()
            .ok_or(Error::new_from_js(value.type_name(), "Object"))?;
        let start = obj.get("start")?;
        let end = obj.get("end")?;
        Ok(Self { start, end })
    }
}

impl<'js> IntoJs<'js> for JsNodeRange {
    fn into_js(self, ctx: &Ctx<'js>) -> Result<Value<'js>> {
        let obj = Object::new(ctx.clone())?;
        obj.set("start", self.start)?;
        obj.set("end", self.end)?;
        obj.into_js(ctx)
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct JsEdit {
    #[serde(rename = "startPos")]
    pub start_pos: u32,
    #[serde(rename = "endPos")]
    pub end_pos: u32,
    #[serde(rename = "insertedText")]
    pub inserted_text: String,
}
impl<'js> FromJs<'js> for JsEdit {
    fn from_js(_ctx: &Ctx<'js>, value: Value<'js>) -> Result<Self> {
        let obj = value
            .as_object()
            .ok_or(Error::new_from_js(value.type_name(), "Object"))?;
        let start_pos = obj.get("startPos")?;
        let end_pos = obj.get("endPos")?;
        let inserted_text = obj.get("insertedText")?;
        Ok(Self {
            start_pos,
            end_pos,
            inserted_text,
        })
    }
}

impl<'js> IntoJs<'js> for JsEdit {
    fn into_js(self, ctx: &Ctx<'js>) -> Result<Value<'js>> {
        let obj = Object::new(ctx.clone())?;
        obj.set("startPos", self.start_pos)?;
        obj.set("endPos", self.end_pos)?;
        obj.set("insertedText", self.inserted_text)?;
        obj.into_js(ctx)
    }
}
