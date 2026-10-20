use std::collections::BTreeSet;
use std::sync::{Arc, Mutex};

/// A source range returned by find/findAll or the exported selector.
/// Lines and columns are zero-based; byte offsets are end-exclusive.
#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MatchLocation {
    pub path: String,
    pub start_byte: usize,
    pub end_byte: usize,
    pub start_line: usize,
    pub end_line: usize,
    pub start_column: usize,
    pub end_column: usize,
    pub text: String,
}

#[derive(Clone, Default)]
pub(crate) struct MatchContext(Arc<Mutex<BTreeSet<MatchLocation>>>);

unsafe impl<'js> rquickjs::JsLifetime<'js> for MatchContext {
    type Changed<'to> = MatchContext;
}

impl MatchContext {
    pub(crate) fn record(&self, location: MatchLocation) {
        self.0.lock().unwrap().insert(location);
    }

    pub(crate) fn get_all(&self) -> Vec<MatchLocation> {
        self.0.lock().unwrap().iter().cloned().collect()
    }
}
