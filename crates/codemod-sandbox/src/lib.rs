mod ast_grep;
pub mod capabilities;
#[cfg(feature = "wasm")]
mod plugins;
mod rquickjs_compat;
pub mod sandbox;
pub mod tree_sitter;
mod utils;

#[cfg(feature = "native")]
pub use ast_grep::{
    execute_ast_grep_on_globs, execute_ast_grep_on_globs_with_fixes, execute_ast_grep_on_paths,
    execute_ast_grep_on_paths_with_fixes,
};
