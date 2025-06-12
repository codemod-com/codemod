#[cfg(feature = "native")]
pub use rquickjs_git::*;

#[cfg(feature = "wasm")]
pub use rquickjs_registry::*;
