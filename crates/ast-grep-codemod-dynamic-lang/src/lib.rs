use ast_grep_core::tree_sitter::{LanguageExt, StrDoc, TSLanguage};
use ast_grep_core::Language;

use ast_grep_core::matcher::{Pattern, PatternBuilder, PatternError};
use ignore::types::{Types, TypesBuilder};
use libloading::{Error as LibError, Library, Symbol};
use serde::{Deserialize, Serialize};
use thiserror::Error;
use tree_sitter::{Language as NativeTS, LANGUAGE_VERSION, MIN_COMPATIBLE_LANGUAGE_VERSION};

use std::borrow::Cow;
use std::fs::canonicalize;
use std::path::{Path, PathBuf};
use std::str::FromStr;
use std::sync::{RwLock, RwLockReadGuard};

mod custom_lang;

pub use custom_lang::{CustomLang, LibraryPath};

type LangIndex = u32;

/// Represents a tree-sitter language loaded as dynamic lib.
#[derive(Copy, Clone, PartialEq, Eq, Hash)]
pub struct DynamicLang {
    index: LangIndex,
    // inline expando char since it is used frequently
    expando: char,
}

impl DynamicLang {
    pub fn all_langs() -> Vec<Self> {
        Self::langs()
            .iter()
            .enumerate()
            .map(|(index, inner)| DynamicLang {
                index: index as LangIndex,
                expando: inner.expando_char,
            })
            .collect()
    }

    pub fn file_types(&self) -> Types {
        let mut builder = TypesBuilder::new();
        let inner = self.inner();
        let mapping = LANG_INDEX.read().unwrap();
        for (ext, i) in mapping.iter() {
            if *i == self.index {
                builder
                    .add(&inner.name, &format!("*.{ext}"))
                    .expect("file pattern must compile");
            }
        }
        builder.select(&inner.name);
        builder.build().expect("file type must be valid")
    }
}

impl Serialize for DynamicLang {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let name = &self.inner().name;
        serializer.serialize_str(name)
    }
}

impl<'de> Deserialize<'de> for DynamicLang {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let name = String::deserialize(deserializer)?;
        DynamicLang::from_str(&name).map_err(serde::de::Error::custom)
    }
}

impl FromStr for DynamicLang {
    type Err = String;
    fn from_str(name: &str) -> Result<Self, Self::Err> {
        let langs = Self::langs();
        for (i, lang) in langs.iter().enumerate() {
            if lang.name == name {
                return Ok(DynamicLang {
                    index: i as LangIndex,
                    expando: lang.expando_char,
                });
            }
        }
        Err(format!("unknown language `{name}`."))
    }
}

struct Inner {
    lang: TSLanguage,
    name: String,
    meta_var_char: char,
    expando_char: char,
    _lib: Library, // Keep lib alive
}

#[derive(Debug, Error)]
pub enum DynamicLangError {
    #[error("Target dynamic lib `{0}` is not configured")]
    NotConfigured(&'static str),
    #[error("cannot load lib")]
    OpenLib(#[source] LibError),
    #[error("cannot read symbol")]
    ReadSymbol(#[source] LibError),
    #[error("Incompatible tree-sitter parser version `{0}`")]
    IncompatibleVersion(usize),
    #[error("cannot get the absolute path of dynamic lib")]
    GetLibPath(#[from] std::io::Error),
}

/// # Safety: we must keep lib in memory after load it.
unsafe fn load_ts_language(
    path: PathBuf,
    name: String,
) -> Result<(Library, TSLanguage), DynamicLangError> {
    let abs_path = canonicalize(path)?;
    let lib = Library::new(abs_path.as_os_str()).map_err(DynamicLangError::OpenLib)?;
    let func: Symbol<unsafe extern "C" fn() -> NativeTS> = lib
        .get(name.as_bytes())
        .map_err(DynamicLangError::ReadSymbol)?;
    let lang = func();
    let version = lang.abi_version();
    if !(MIN_COMPATIBLE_LANGUAGE_VERSION..=LANGUAGE_VERSION).contains(&version) {
        Err(DynamicLangError::IncompatibleVersion(version))
    } else {
        Ok((lib, lang))
    }
}

// Replaced unsafe global statics with thread-safe RwLocks
static DYNAMIC_LANG: RwLock<Vec<Inner>> = RwLock::new(vec![]);
static LANG_INDEX: RwLock<Vec<(String, u32)>> = RwLock::new(vec![]);

#[derive(Default)]
pub struct Registration {
    pub lang_name: String,
    pub lib_path: PathBuf,
    pub symbol: String,
    pub meta_var_char: Option<char>,
    pub expando_char: Option<char>,
    pub extensions: Vec<String>,
}

impl DynamicLang {
    pub fn register(regs: Vec<Registration>) -> Result<(), DynamicLangError> {
        let mut langs = vec![];
        let mut mapping = vec![];
        for reg in regs {
            Self::register_one(reg, &mut langs, &mut mapping)?;
        }
        {
            let mut lang_guard = DYNAMIC_LANG.write().unwrap();
            *lang_guard = langs;
        }
        {
            let mut map_guard = LANG_INDEX.write().unwrap();
            *map_guard = mapping;
        }
        Ok(())
    }

    pub fn name(&self) -> &str {
        &self.inner().name
    }

    fn register_one(
        reg: Registration,
        langs: &mut Vec<Inner>,
        mapping: &mut Vec<(String, LangIndex)>,
    ) -> Result<(), DynamicLangError> {
        let (_lib, lang) = unsafe { load_ts_language(reg.lib_path, reg.symbol)? };
        let meta_var_char = reg.meta_var_char.unwrap_or('$');
        let expando_char = reg.expando_char.unwrap_or(meta_var_char);
        let inner = Inner {
            name: reg.lang_name,
            lang,
            meta_var_char,
            expando_char,
            _lib,
        };
        langs.push(inner);
        let idx = langs.len() as LangIndex - 1;
        for ext in reg.extensions {
            mapping.push((ext, idx));
        }
        Ok(())
    }

    fn inner(&self) -> &Inner {
        let langs = Self::langs();
        unsafe { &*std::ptr::addr_of!(langs[self.index as usize]) }
    }

    fn langs() -> RwLockReadGuard<'static, Vec<Inner>> {
        DYNAMIC_LANG.read().unwrap()
    }
}

impl Language for DynamicLang {
    fn pre_process_pattern<'q>(&self, query: &'q str) -> Cow<'q, str> {
        if self.meta_var_char() == self.expando_char() {
            return Cow::Borrowed(query);
        };
        let mut buf = [0; 4];
        let expando = self.expando_char().encode_utf8(&mut buf);
        let replaced = query.replace(self.meta_var_char(), expando);
        Cow::Owned(replaced)
    }

    #[inline]
    fn meta_var_char(&self) -> char {
        self.inner().meta_var_char
    }

    #[inline]
    fn expando_char(&self) -> char {
        self.expando
    }

    fn kind_to_id(&self, kind: &str) -> u16 {
        let inner = self.inner();
        inner.lang.id_for_node_kind(kind, true)
    }

    fn field_to_id(&self, field: &str) -> Option<u16> {
        let inner = self.inner();
        inner.lang.field_id_for_name(field).map(|f| f.get())
    }

    fn from_path<P: AsRef<Path>>(path: P) -> Option<Self> {
        let ext = path.as_ref().extension()?.to_str()?;
        let mapping = LANG_INDEX.read().ok()?;
        let langs = Self::langs();
        mapping.iter().find_map(|(p, idx)| {
            if p == ext {
                let index = *idx;
                Some(Self {
                    index,
                    expando: langs[*idx as usize].expando_char,
                })
            } else {
                None
            }
        })
    }

    fn build_pattern(&self, builder: &PatternBuilder) -> Result<Pattern, PatternError> {
        builder.build(|src| {
            let doc = StrDoc::try_new(src, *self)?;
            Ok(doc)
        })
    }
}

impl LanguageExt for DynamicLang {
    fn get_ts_language(&self) -> TSLanguage {
        self.inner().lang.clone()
    }
}
