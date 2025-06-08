#[cfg(feature = "wasm")]
mod wasi_bin {
    mod ast_grep;
    mod capabilities;
    mod plugins;
    mod rquickjs_compat;
    mod sandbox;
    mod utils;

    pub use crate::sandbox::wasm::*;
}

#[cfg(feature = "wasm")]
pub use wasi_bin::*;

pub fn main() {}
