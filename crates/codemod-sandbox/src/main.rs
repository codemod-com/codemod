#[cfg(feature = "wasm")]
mod ast_grep;
#[cfg(feature = "wasm")]
mod capabilities;
#[cfg(feature = "wasm")]
mod plugins;
#[cfg(feature = "wasm")]
mod rquickjs_compat;
#[cfg(feature = "wasm")]
mod sandbox;
#[cfg(feature = "wasm")]
mod utils;

#[cfg(feature = "wasm")]
pub use crate::sandbox::wasm::*;

pub fn main() {}
