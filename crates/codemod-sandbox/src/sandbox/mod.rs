#[cfg(feature = "native")]
pub mod engine;
#[cfg(feature = "native")]
pub mod errors;
#[cfg(feature = "native")]
pub mod filesystem;
#[cfg(feature = "native")]
pub mod loaders;
#[cfg(feature = "native")]
pub mod resolvers;

// Platform-specific modules
#[cfg(feature = "wasm")]
pub mod wasm;
