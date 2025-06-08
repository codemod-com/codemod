mod ast_grep;
mod capabilities;
mod plugins;
mod rquickjs_compat;
mod sandbox;
mod utils;

#[cfg(feature = "wasm")]
pub use crate::sandbox::wasm::*;

pub fn main() {}
