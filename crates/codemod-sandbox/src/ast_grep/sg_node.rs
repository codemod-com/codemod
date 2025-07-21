#[cfg(feature = "wasm")]
use crate::ast_grep::wasm_lang::WasmDoc;
#[cfg(not(feature = "wasm"))]
use ast_grep_core::tree_sitter::StrDoc as TreeSitterStrDoc;
use ast_grep_core::{AstGrep, Node, NodeMatch};

#[cfg(feature = "wasm")]
use crate::rquickjs_compat as rquickjs_git;

#[cfg(not(feature = "wasm"))]
use ast_grep_dynamic::DynamicLang;

use crate::rquickjs_compat::{
    class, class::Trace, methods, Ctx, Exception, JsLifetime, Result, Value,
};
use std::marker::PhantomData;
use std::str::FromStr;
use std::sync::Arc;

use crate::ast_grep::types::JsEdit;
use crate::ast_grep::types::JsNodeRange;
use crate::ast_grep::utils::{convert_matcher, JsMatcherRjs};

#[cfg(not(feature = "wasm"))]
type StrDoc = TreeSitterStrDoc<DynamicLang>;
#[cfg(feature = "wasm")]
type StrDoc = WasmDoc;

// No manual Trace for PhantomData - orphan rule violation

#[derive(Trace)]
#[class(rename_all = "camelCase")]
pub struct SgRootRjs<'js> {
    #[qjs(skip_trace)]
    // AstGrep is not Trace, Arc<T> is Trace if T is Send+Sync+'static or skipped
    pub(crate) inner_arc: Arc<AstGrep<StrDoc>>,
    #[qjs(skip_trace)]
    pub(crate) filename: Option<String>,
    #[qjs(skip_trace)]
    _phantom: PhantomData<&'js ()>,
}

unsafe impl<'js> JsLifetime<'js> for SgRootRjs<'js> {
    type Changed<'to> = SgRootRjs<'to>;
}

#[methods]
impl<'js> SgRootRjs<'js> {
    #[qjs(constructor)]
    pub fn new_constructor_js(_ctx: Ctx<'_>) -> Result<Self> {
        Err(Exception::throw_type(
            &_ctx,
            "'SgRoot' is not constructible. Use 'parse(lang, src)'.",
        ))
    }

    pub fn root(&self, _ctx: Ctx<'js>) -> Result<SgNodeRjs<'js>> {
        let node = self.inner_arc.root();
        let node_match: NodeMatch<_> = node.into();
        let static_node_match: NodeMatch<'static, StrDoc> =
            unsafe { std::mem::transmute(node_match) };
        Ok(SgNodeRjs {
            grep_arc: self.inner_arc.clone(),
            inner_node: static_node_match,
            _phantom: PhantomData,
        })
    }

    pub fn filename(&self) -> Result<String> {
        Ok(self.filename.clone().unwrap_or_default())
    }

    pub fn source(&self) -> Result<String> {
        let str_slice: &str = "asd";
        Ok(str_slice.to_string())
    }
}

impl SgRootRjs<'_> {
    pub fn try_new(
        lang_str: String,
        src: String,
        filename: Option<String>,
    ) -> std::result::Result<Self, String> {
        #[cfg(feature = "wasm")]
        {
            if !crate::ast_grep::wasm_lang::WasmLang::is_parser_initialized() {
                return Err(
                    "Tree-sitter parser not initialized. Call setupParser() first before parsing."
                        .to_string(),
                );
            }

            let lang = crate::ast_grep::wasm_lang::WasmLang::from_str(&lang_str)
                .map_err(|e| e.to_string())?;
            let doc = crate::ast_grep::wasm_lang::WasmDoc::try_new(src, lang)
                .map_err(|e| e.to_string())?;

            Ok(SgRootRjs {
                inner_arc: Arc::new(unsafe { std::mem::transmute(doc) }),
                filename,
                _phantom: PhantomData,
            })
        }

        #[cfg(not(feature = "wasm"))]
        {
            let lang = DynamicLang::from_str(&lang_str)
                .map_err(|e| format!("Unsupported language: {lang_str}. Error: {e}"))?;
            let grep = AstGrep::new(src, lang);
            Ok(SgRootRjs {
                inner_arc: Arc::new(grep),
                _phantom: PhantomData,
                filename,
            })
        }
    }
}

#[derive(Trace, Clone)]
#[class(rename_all = "camelCase")]
pub struct SgNodeRjs<'js> {
    #[qjs(skip_trace)] // AstGrep is not Trace
    pub(crate) grep_arc: Arc<AstGrep<StrDoc>>,
    #[qjs(skip_trace)] // NodeMatch is not Trace
    pub(crate) inner_node: NodeMatch<'static, StrDoc>,
    #[qjs(skip_trace)]
    _phantom: PhantomData<&'js ()>,
}

unsafe impl<'js> JsLifetime<'js> for SgNodeRjs<'js> {
    type Changed<'to> = SgNodeRjs<'to>;
}

#[methods]
impl<'js> SgNodeRjs<'js> {
    pub fn text(&self) -> Result<String> {
        Ok(self.inner_node.text().to_string())
    }

    pub fn is(&self, kind: String) -> Result<bool> {
        Ok(self.inner_node.kind() == kind)
    }

    pub fn kind(&self) -> Result<String> {
        Ok(self.inner_node.kind().to_string())
    }

    pub fn range(&self, _ctx: Ctx<'js>) -> Result<JsNodeRange> {
        let start_pos_obj = self.inner_node.start_pos();
        let end_pos_obj = self.inner_node.end_pos();
        let byte_range = self.inner_node.range();

        let result = JsNodeRange {
            start: crate::ast_grep::types::JsPosition {
                row: start_pos_obj.line(),
                column: start_pos_obj.column(&self.inner_node),
                index: byte_range.start,
            },
            end: crate::ast_grep::types::JsPosition {
                row: end_pos_obj.line(),
                column: end_pos_obj.column(&self.inner_node),
                index: byte_range.end,
            },
        };
        Ok(result)
    }

    pub fn id(&self) -> Result<usize> {
        Ok(self.inner_node.node_id())
    }

    #[qjs(rename = "isLeaf")]
    pub fn is_leaf(&self) -> Result<bool> {
        Ok(self.inner_node.is_leaf())
    }

    #[qjs(rename = "isNamed")]
    pub fn is_named(&self) -> Result<bool> {
        Ok(self.inner_node.is_named())
    }

    #[qjs(rename = "isNamedLeaf")]
    pub fn is_named_leaf(&self) -> Result<bool> {
        Ok(self.inner_node.is_named_leaf())
    }

    pub fn parent(&self) -> Result<Option<SgNodeRjs<'js>>> {
        Ok(self.inner_node.parent().map(|node: Node<StrDoc>| {
            let node_match: NodeMatch<_> = node.into();
            let static_node_match: NodeMatch<'static, StrDoc> =
                unsafe { std::mem::transmute(node_match) };
            SgNodeRjs {
                grep_arc: self.grep_arc.clone(),
                inner_node: static_node_match,
                _phantom: PhantomData,
            }
        }))
    }
    pub fn child(&self, nth: usize) -> Result<Option<SgNodeRjs<'js>>> {
        Ok(self.inner_node.child(nth).map(|node: Node<StrDoc>| {
            let node_match: NodeMatch<_> = node.into();
            let static_node_match: NodeMatch<'static, StrDoc> =
                unsafe { std::mem::transmute(node_match) };
            SgNodeRjs {
                grep_arc: self.grep_arc.clone(),
                inner_node: static_node_match,
                _phantom: PhantomData,
            }
        }))
    }

    pub fn children(&self) -> Result<Vec<SgNodeRjs<'js>>> {
        Ok(self
            .inner_node
            .children()
            .map(|node: Node<StrDoc>| {
                let node_match: NodeMatch<_> = node.into();
                let static_node_match: NodeMatch<'static, StrDoc> =
                    unsafe { std::mem::transmute(node_match) };
                SgNodeRjs {
                    grep_arc: self.grep_arc.clone(),
                    inner_node: static_node_match,
                    _phantom: PhantomData,
                }
            })
            .collect())
    }

    pub fn ancestors(&self) -> Result<Vec<SgNodeRjs<'js>>> {
        Ok(self
            .inner_node
            .ancestors()
            .map(|node: Node<StrDoc>| {
                let node_match: NodeMatch<_> = node.into();
                let static_node_match: NodeMatch<'static, StrDoc> =
                    unsafe { std::mem::transmute(node_match) };
                SgNodeRjs {
                    grep_arc: self.grep_arc.clone(),
                    inner_node: static_node_match,
                    _phantom: PhantomData,
                }
            })
            .collect())
    }

    pub fn next(&self) -> Result<Option<SgNodeRjs<'js>>> {
        Ok(self.inner_node.next().map(|node: Node<StrDoc>| {
            let node_match: NodeMatch<_> = node.into();
            let static_node_match: NodeMatch<'static, StrDoc> =
                unsafe { std::mem::transmute(node_match) };
            SgNodeRjs {
                grep_arc: self.grep_arc.clone(),
                inner_node: static_node_match,
                _phantom: PhantomData,
            }
        }))
    }

    #[qjs(rename = "nextAll")]
    pub fn next_all(&self) -> Result<Vec<SgNodeRjs<'js>>> {
        Ok(self
            .inner_node
            .next_all()
            .map(|node: Node<StrDoc>| {
                let node_match: NodeMatch<_> = node.into();
                let static_node_match: NodeMatch<'static, StrDoc> =
                    unsafe { std::mem::transmute(node_match) };
                SgNodeRjs {
                    grep_arc: self.grep_arc.clone(),
                    inner_node: static_node_match,
                    _phantom: PhantomData,
                }
            })
            .collect())
    }

    pub fn prev(&self) -> Result<Option<SgNodeRjs<'js>>> {
        Ok(self.inner_node.prev().map(|node: Node<StrDoc>| {
            let node_match: NodeMatch<_> = node.into();
            let static_node_match: NodeMatch<'static, StrDoc> =
                unsafe { std::mem::transmute(node_match) };
            SgNodeRjs {
                grep_arc: self.grep_arc.clone(),
                inner_node: static_node_match,
                _phantom: PhantomData,
            }
        }))
    }

    #[qjs(rename = "prevAll")]
    pub fn prev_all(&self) -> Result<Vec<SgNodeRjs<'js>>> {
        Ok(self
            .inner_node
            .prev_all()
            .map(|node: Node<StrDoc>| {
                let node_match: NodeMatch<_> = node.into();
                let static_node_match: NodeMatch<'static, StrDoc> =
                    unsafe { std::mem::transmute(node_match) };
                SgNodeRjs {
                    grep_arc: self.grep_arc.clone(),
                    inner_node: static_node_match,
                    _phantom: PhantomData,
                }
            })
            .collect())
    }

    pub fn field(&self, name: String) -> Result<Option<SgNodeRjs<'js>>> {
        Ok(self.inner_node.field(&name).map(|node: Node<StrDoc>| {
            let node_match: NodeMatch<_> = node.into();
            let static_node_match: NodeMatch<'static, StrDoc> =
                unsafe { std::mem::transmute(node_match) };
            SgNodeRjs {
                grep_arc: self.grep_arc.clone(),
                inner_node: static_node_match,
                _phantom: PhantomData,
            }
        }))
    }

    #[qjs(rename = "fieldChildren")]
    pub fn field_children(&self, name: String) -> Result<Vec<SgNodeRjs<'js>>> {
        Ok(self
            .inner_node
            .field_children(&name)
            .map(|node: Node<StrDoc>| {
                let node_match: NodeMatch<_> = node.into();
                let static_node_match: NodeMatch<'static, StrDoc> =
                    unsafe { std::mem::transmute(node_match) };
                SgNodeRjs {
                    grep_arc: self.grep_arc.clone(),
                    inner_node: static_node_match,
                    _phantom: PhantomData,
                }
            })
            .collect())
    }

    pub fn find(&self, value: Value<'js>, ctx: Ctx<'js>) -> Result<Option<SgNodeRjs<'js>>> {
        let lang = *self.inner_node.lang();
        let matcher = convert_matcher(value, lang, &ctx)?;

        match matcher {
            JsMatcherRjs::Pattern(pattern) => match self.inner_node.find(pattern) {
                Some(node) => {
                    let node_match: NodeMatch<_> = node;
                    let static_node_match: NodeMatch<'static, StrDoc> =
                        unsafe { std::mem::transmute(node_match) };
                    Ok(Some(SgNodeRjs {
                        grep_arc: self.grep_arc.clone(),
                        inner_node: static_node_match,
                        _phantom: PhantomData,
                    }))
                }
                None => Ok(None),
            },
            JsMatcherRjs::Kind(kind_matcher) => match self.inner_node.find(kind_matcher) {
                Some(node) => {
                    let node_match: NodeMatch<_> = node;
                    let static_node_match: NodeMatch<'static, StrDoc> =
                        unsafe { std::mem::transmute(node_match) };
                    Ok(Some(SgNodeRjs {
                        grep_arc: self.grep_arc.clone(),
                        inner_node: static_node_match,
                        _phantom: PhantomData,
                    }))
                }
                None => Ok(None),
            },
            JsMatcherRjs::Config(config) => match self.inner_node.find(config) {
                Some(node) => {
                    let node_match: NodeMatch<_> = node;
                    let static_node_match: NodeMatch<'static, StrDoc> =
                        unsafe { std::mem::transmute(node_match) };
                    Ok(Some(SgNodeRjs {
                        grep_arc: self.grep_arc.clone(),
                        inner_node: static_node_match,
                        _phantom: PhantomData,
                    }))
                }
                None => Ok(None),
            },
        }
    }

    #[qjs(rename = "findAll")]
    pub fn find_all(&self, value: Value<'js>, ctx: Ctx<'js>) -> Result<Vec<SgNodeRjs<'js>>> {
        let lang = *self.inner_node.lang();
        let matcher = convert_matcher(value, lang, &ctx)?;

        match matcher {
            JsMatcherRjs::Pattern(pattern) => Ok(self
                .inner_node
                .find_all(pattern)
                .map(|node| {
                    let node_match: NodeMatch<_> = node;
                    let static_node_match: NodeMatch<'static, StrDoc> =
                        unsafe { std::mem::transmute(node_match) };
                    SgNodeRjs {
                        grep_arc: self.grep_arc.clone(),
                        inner_node: static_node_match,
                        _phantom: PhantomData,
                    }
                })
                .collect()),
            JsMatcherRjs::Kind(kind_matcher) => Ok(self
                .inner_node
                .find_all(kind_matcher)
                .map(|node| {
                    let node_match: NodeMatch<_> = node;
                    let static_node_match: NodeMatch<'static, StrDoc> =
                        unsafe { std::mem::transmute(node_match) };
                    SgNodeRjs {
                        grep_arc: self.grep_arc.clone(),
                        inner_node: static_node_match,
                        _phantom: PhantomData,
                    }
                })
                .collect()),
            JsMatcherRjs::Config(config) => Ok(self
                .inner_node
                .find_all(config)
                .map(|node| {
                    let node_match: NodeMatch<_> = node;
                    let static_node_match: NodeMatch<'static, StrDoc> =
                        unsafe { std::mem::transmute(node_match) };
                    SgNodeRjs {
                        grep_arc: self.grep_arc.clone(),
                        inner_node: static_node_match,
                        _phantom: PhantomData,
                    }
                })
                .collect()),
        }
    }

    pub fn matches(&self, value: Value<'js>, ctx: Ctx<'js>) -> Result<bool> {
        let lang = *self.inner_node.lang();
        let matcher = convert_matcher(value, lang, &ctx)?;

        match matcher {
            JsMatcherRjs::Pattern(pattern) => Ok(self.inner_node.matches(pattern)),
            JsMatcherRjs::Kind(kind_matcher) => Ok(self.inner_node.matches(kind_matcher)),
            JsMatcherRjs::Config(config) => Ok(self.inner_node.matches(config)),
        }
    }

    pub fn inside(&self, value: Value<'js>, ctx: Ctx<'js>) -> Result<bool> {
        let lang = *self.inner_node.lang();
        let matcher = convert_matcher(value, lang, &ctx)?;

        match matcher {
            JsMatcherRjs::Pattern(pattern) => Ok(self.inner_node.inside(pattern)),
            JsMatcherRjs::Kind(kind_matcher) => Ok(self.inner_node.inside(kind_matcher)),
            JsMatcherRjs::Config(config) => Ok(self.inner_node.inside(config)),
        }
    }

    pub fn has(&self, value: Value<'js>, ctx: Ctx<'js>) -> Result<bool> {
        let lang = *self.inner_node.lang();
        let matcher = convert_matcher(value, lang, &ctx)?;

        match matcher {
            JsMatcherRjs::Pattern(pattern) => Ok(self.inner_node.has(pattern)),
            JsMatcherRjs::Kind(kind_matcher) => Ok(self.inner_node.has(kind_matcher)),
            JsMatcherRjs::Config(config) => Ok(self.inner_node.has(config)),
        }
    }

    #[qjs(rename = "getMatch")]
    pub fn get_match(&self, m: String) -> Result<Option<SgNodeRjs<'js>>> {
        let node = self
            .inner_node
            .get_env()
            .get_match(&m)
            .cloned()
            .map(NodeMatch::from)
            .map(|node_match| {
                let static_node_match: NodeMatch<'static, StrDoc> =
                    unsafe { std::mem::transmute(node_match) };
                SgNodeRjs {
                    grep_arc: self.grep_arc.clone(),
                    inner_node: static_node_match,
                    _phantom: PhantomData,
                }
            });

        Ok(node)
    }

    #[qjs(rename = "getMultipleMatches")]
    pub fn get_multiple_matches(&self, m: String) -> Result<Vec<SgNodeRjs<'js>>> {
        let nodes = self
            .inner_node
            .get_env()
            .get_multiple_matches(&m)
            .into_iter()
            .map(|node| {
                let node_match = NodeMatch::from(node);
                let static_node_match: NodeMatch<'static, StrDoc> =
                    unsafe { std::mem::transmute(node_match) };
                SgNodeRjs {
                    grep_arc: self.grep_arc.clone(),
                    inner_node: static_node_match,
                    _phantom: PhantomData,
                }
            })
            .collect();

        Ok(nodes)
    }

    pub fn replace(&self, text: String) -> Result<JsEdit> {
        let byte_range = self.inner_node.range();
        Ok(JsEdit {
            start_pos: byte_range.start as u32,
            end_pos: byte_range.end as u32,
            inserted_text: text,
        })
    }

    #[qjs(rename = "commitEdits")]
    pub fn commit_edits(&self, edits: Vec<JsEdit>) -> Result<String> {
        let mut sorted_edits = edits.clone();
        sorted_edits.sort_by_key(|edit| edit.start_pos);

        let mut new_content = String::new();
        let old_content = self.inner_node.text();

        let offset = self.inner_node.range().start;
        let mut start = 0;

        for edit in sorted_edits {
            let pos = edit.start_pos as usize - offset;
            // Skip overlapping edits
            if start > pos {
                continue;
            }
            new_content.push_str(&old_content[start..pos]);
            new_content.push_str(&edit.inserted_text);
            start = edit.end_pos as usize - offset;
        }

        // Add trailing content
        new_content.push_str(&old_content[start..]);
        Ok(new_content)
    }
}
