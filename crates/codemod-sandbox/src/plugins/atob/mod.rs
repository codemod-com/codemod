use rquickjs::Ctx;
use rquickjs::Result;
use wasm_bindgen::prelude::*;

pub fn init(ctx: &Ctx<'_>) -> Result<()> {
    use rquickjs::function::Func;
    let globals = ctx.globals();

    globals.set("atob", Func::from(qj_atob))?;
    globals.set("btoa", Func::from(qj_btoa))?;

    Ok(())
}

#[wasm_bindgen]
extern "C" {
    fn atob(s: &str) -> String;
    fn btoa(s: &str) -> String;
}

fn qj_atob(s: rquickjs::String) -> Result<rquickjs::String> {
    let ctx = s.ctx().clone();
    let s = s.to_string().unwrap();
    let result = atob(s.as_str());
    rquickjs::String::from_str(ctx, result.as_str())
}

fn qj_btoa(s: rquickjs::String) -> Result<rquickjs::String> {
    let ctx = s.ctx().clone();
    let s = s.to_string().unwrap();
    let result = btoa(s.as_str());
    rquickjs::String::from_str(ctx, result.as_str())
}
