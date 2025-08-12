mod ast_grep;
pub mod capabilities;
#[cfg(feature = "wasm")]
mod plugins;
pub mod sandbox;
pub mod utils;

#[cfg(feature = "native")]
pub use ast_grep::execute_ast_grep;
