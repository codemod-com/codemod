use std::sync::Arc;
use swc_core::common::{errors::Handler, SourceMap};
use swc_ts_fast_strip::{Mode, Options};
struct NullEmitter;
impl swc_core::common::errors::Emitter for NullEmitter {
    fn emit(&mut self, _db: &mut swc_core::common::errors::DiagnosticBuilder<'_>) {}
}

#[allow(dead_code)]
pub fn transpile(source: String, filename: String) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
    // Create source map
    let cm: Arc<SourceMap> = Default::default();

    let handler = Handler::with_emitter(false, false, Box::new(NullEmitter));

    // Strip TypeScript types to convert to JavaScript
    let code = swc_ts_fast_strip::operate(
        &cm,
        &handler,
        source,
        Options {
            filename: Some(filename),
            mode: Mode::StripOnly,
            source_map: false,
            ..Default::default()
        },
    )?
    .code
    .into_bytes();

    Ok(code)
}
