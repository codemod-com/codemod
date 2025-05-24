use std::str::FromStr;

use ast_grep_core::language::Language;
use ast_grep_core::matcher::{Pattern, PatternBuilder, PatternError};
use ast_grep_core::source::{Content, Doc, Edit, SgNode};
use ast_grep_core::tree_sitter::LanguageExt;
use ast_grep_core::Position;
use serde::{de, Deserialize, Deserializer};
use std::borrow::Cow;
use std::ops::Range;
use std::sync::Mutex;
use wasm_bindgen::prelude::*;
use web_tree_sitter_sg as ts;
use web_tree_sitter_sg::{Parser, Point, SyntaxNode, Tree};

type TSLanguage = ts::Language;
type AstGrepTSLanguage = ast_grep_core::tree_sitter::TSLanguage;
type TSLanguageError = ts::LanguageError;

#[derive(Clone, Copy)]
pub enum WasmLang {
    JavaScript,
    TypeScript,
    Tsx,
    // not so well supported lang...
    Bash,
    C,
    CSharp,
    Css,
    Cpp,
    Elixir,
    Go,
    Haskell,
    Html,
    Java,
    Json,
    Kotlin,
    Lua,
    Php,
    Python,
    Ruby,
    Rust,
    Scala,
    Swift,
    Yaml,
}

use WasmLang::*;

#[derive(Debug)]
pub struct NotSupport(String);

impl std::error::Error for NotSupport {}

impl std::fmt::Display for NotSupport {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "Language {} is not supported.", self.0)
    }
}

impl FromStr for WasmLang {
    type Err = NotSupport;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(match s {
            "javascript" => JavaScript,
            "typescript" => TypeScript,
            "tsx" => Tsx,
            "bash" => Bash,
            "c" => C,
            "csharp" => CSharp,
            "css" => Css,
            "cpp" => Cpp,
            "elixir" => Elixir,
            "go" => Go,
            "html" => Html,
            "haskell" => Haskell,
            "java" => Java,
            "json" => Json,
            "lua" => Lua,
            "kotlin" => Kotlin,
            "php" => Php,
            "python" => Python,
            "ruby" => Ruby,
            "rust" => Rust,
            "scala" => Scala,
            "swift" => Swift,
            "yaml" => Yaml,
            _ => return Err(NotSupport(s.to_string())),
        })
    }
}

impl<'de> Deserialize<'de> for WasmLang {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        FromStr::from_str(&s).map_err(de::Error::custom)
    }
}

#[derive(Clone)]
struct TsLang(TSLanguage);

unsafe impl Send for TsLang {}
unsafe impl Sync for TsLang {}

static TS_LANG: Mutex<Option<TsLang>> = Mutex::new(None);
static LANG: Mutex<WasmLang> = Mutex::new(JavaScript);

impl WasmLang {
    pub async fn set_current(lang: &str, parser_path: &str) -> Result<(), JsError> {
        let lang = WasmLang::from_str(lang)?;
        let mut curr_lang = LANG.lock().expect_throw("set language error");
        *curr_lang = lang;
        setup_parser(parser_path).await?;
        Ok(())
    }

    #[allow(unused)]
    pub fn get_current() -> Self {
        *LANG.lock().expect_throw("get language error")
    }

    pub fn is_parser_initialized() -> bool {
        TS_LANG.lock().expect_throw("get language error").is_some()
    }
}

async fn setup_parser(parser_path: &str) -> Result<(), SgWasmError> {
    let parser = ts::Parser::new()?;
    let lang = get_lang(parser_path).await?;
    parser.set_language(&lang)?;
    let mut curr_lang = TS_LANG.lock().expect_throw("set language error");
    *curr_lang = Some(TsLang(lang));
    Ok(())
}

#[cfg(target_arch = "wasm32")]
async fn get_lang(parser_path: &str) -> Result<TSLanguage, SgWasmError> {
    let lang = TSLanguage::load_path(parser_path).await?;
    Ok(lang)
}

#[cfg(not(target_arch = "wasm32"))]
async fn get_lang(_path: &str) -> Result<TSLanguage, SgWasmError> {
    unreachable!()
}

impl Language for WasmLang {
    fn expando_char(&self) -> char {
        use WasmLang as W;
        match self {
            W::Bash => '$',
            W::C => '_',
            W::Cpp => '_',
            W::CSharp => 'µ',
            W::Css => '_',
            W::Elixir => 'µ',
            W::Go => 'µ',
            W::Html => 'z',
            W::Java => '$',
            W::JavaScript => '$',
            W::Json => '$',
            W::Haskell => 'µ',
            W::Kotlin => 'µ',
            W::Lua => '$',
            W::Php => 'µ',
            W::Python => 'µ',
            W::Ruby => 'µ',
            W::Rust => 'µ',
            W::Scala => '$',
            W::Swift => 'µ',
            W::TypeScript => '$',
            W::Tsx => '$',
            W::Yaml => '$',
        }
    }

    fn build_pattern(&self, builder: &PatternBuilder) -> Result<Pattern, PatternError> {
        builder.build(|src| {
            let src = src.to_string();
            let ret = WasmDoc::try_new(src, self.clone()).map_err(|e| e.to_string());
            Ok(ret?)
        })
    }

    fn pre_process_pattern<'q>(&self, query: &'q str) -> Cow<'q, str> {
        pre_process_pattern(self.expando_char(), query)
    }
    fn kind_to_id(&self, kind: &str) -> u16 {
        let lang = self.get_ts_language();
        lang.id_for_node_kind(kind, true)
    }
    fn field_to_id(&self, field: &str) -> Option<u16> {
        let lang = self.get_ts_language();
        lang.field_id_for_name(field)
    }
}

impl LanguageExt for WasmLang {
    fn get_ts_language(&self) -> AstGrepTSLanguage {
        let lang_guard = TS_LANG.lock().expect_throw("get language error");

        let wasm_lang = lang_guard
            .clone()
            .unwrap_or_else(|| {
                panic!("Tree-sitter parser not initialized. Call setupParser() first before using any parsing functions.");
            })
            .0;

        // SAFETY: TSLanguage (web_tree_sitter_sg::Language) and AstGrepTSLanguage
        // (ast_grep_core::tree_sitter::TSLanguage) are essentially the same type
        unsafe { std::mem::transmute(wasm_lang) }
    }
}

fn pre_process_pattern(expando: char, query: &str) -> Cow<str> {
    let mut ret = Vec::with_capacity(query.len());
    let mut dollar_count = 0;
    for c in query.chars() {
        if c == '$' {
            dollar_count += 1;
            continue;
        }
        let need_replace = matches!(c, 'A'..='Z' | '_') // $A or $$A or $$$A
      || dollar_count == 3; // anonymous multiple
        let sigil = if need_replace { expando } else { '$' };
        ret.extend(std::iter::repeat(sigil).take(dollar_count));
        dollar_count = 0;
        ret.push(c);
    }
    // trailing anonymous multiple
    let sigil = if dollar_count == 3 { expando } else { '$' };
    ret.extend(std::iter::repeat(sigil).take(dollar_count));
    std::borrow::Cow::Owned(ret.into_iter().collect())
}

#[derive(Clone)]
pub struct Wrapper {
    inner: Vec<char>,
}
impl Wrapper {
    fn accept_edit(&mut self, edit: &Edit<Self>) -> ts::Edit {
        let start_byte = edit.position;
        let old_end_byte = edit.position + edit.deleted_length;
        let new_end_byte = edit.position + edit.inserted_text.len();
        let mut input = self.inner.to_vec();
        let start_position = pos_for_char_offset(&input, start_byte);
        let old_end_position = pos_for_char_offset(&input, old_end_byte);
        input.splice(start_byte..old_end_byte, edit.inserted_text.clone());
        let new_end_position = pos_for_char_offset(&input, new_end_byte);
        ts::Edit::new(
            start_byte as u32,
            old_end_byte as u32,
            new_end_byte as u32,
            &start_position,
            &old_end_position,
            &new_end_position,
        )
    }
}

impl Content for Wrapper {
    type Underlying = char;
    fn get_range(&self, range: Range<usize>) -> &[char] {
        &self.inner[range]
    }
    fn decode_str(src: &str) -> Cow<[Self::Underlying]> {
        Cow::Owned(src.chars().collect())
    }
    fn encode_bytes(bytes: &[Self::Underlying]) -> Cow<str> {
        Cow::Owned(bytes.iter().collect())
    }

    fn get_char_column(&self, column: usize, _: usize) -> usize {
        column
    }
}

fn pos_for_char_offset(input: &[char], offset: usize) -> Point {
    debug_assert!(offset <= input.len());
    let (mut row, mut col) = (0, 0);
    for &c in input.iter().take(offset) {
        if '\n' == c {
            row += 1;
            col = 0;
        } else {
            col += 1;
        }
    }
    Point::new(row, col)
}

#[derive(Clone)]
pub struct WasmDoc {
    lang: WasmLang,
    source: Wrapper,
    tree: Tree,
}

#[derive(Clone, Debug)]
pub enum SgWasmError {
    ParserError(ts::ParserError),
    LanguageError(TSLanguageError),
    FailedToParse,
}

impl std::fmt::Display for SgWasmError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            SgWasmError::ParserError(err) => write!(f, "Parser error: {}", err.message()),
            SgWasmError::LanguageError(err) => write!(f, "Language error: {}", err.message()),
            SgWasmError::FailedToParse => write!(f, "Failed to parse"),
        }
    }
}

impl std::error::Error for SgWasmError {}

impl From<ts::ParserError> for SgWasmError {
    fn from(err: ts::ParserError) -> Self {
        SgWasmError::ParserError(err)
    }
}
impl From<TSLanguageError> for SgWasmError {
    fn from(err: TSLanguageError) -> Self {
        SgWasmError::LanguageError(err)
    }
}

impl WasmDoc {
    pub fn try_new(src: String, lang: WasmLang) -> Result<Self, SgWasmError> {
        let source = Wrapper {
            inner: src.chars().collect(),
        };
        let parser = Parser::new()?;
        let ast_grep_lang = lang.get_ts_language();
        // Convert back to web_tree_sitter_sg::Language for the parser
        let ts_lang = unsafe { convert_to_wasm_lang(ast_grep_lang) };
        parser.set_language(&ts_lang)?;
        let Some(tree) = parser.parse_with_string(&src.into(), None, None)? else {
            return Err(SgWasmError::FailedToParse);
        };
        Ok(Self { source, lang, tree })
    }
}

#[derive(Clone)]
pub struct Node(pub SyntaxNode);
impl<'a> SgNode<'a> for Node {
    fn parent(&self) -> Option<Self> {
        self.0.parent().map(Node)
    }
    fn ancestors(&self, _root: Self) -> impl Iterator<Item = Self> {
        let mut parent = self.0.parent();
        std::iter::from_fn(move || {
            let inner = parent.clone()?;
            let ret = Some(Node(inner.clone()));
            parent = inner.parent();
            ret
        })
    }
    // fn dfs(&self) -> impl Iterator<Item = Self> {
    //   TsPre::new(self)
    // }
    fn child(&self, nth: usize) -> Option<Self> {
        self.0.child(nth as u32).map(Node)
    }
    fn children(&self) -> impl ExactSizeIterator<Item = Self> {
        self.0
            .children()
            .to_vec()
            .into_iter()
            .map(|n| n.unchecked_into::<SyntaxNode>())
            .map(Node)
    }
    fn child_by_field_id(&self, field_id: u16) -> Option<Self> {
        self.0.child_for_field_id(field_id).map(Node)
    }
    fn next(&self) -> Option<Self> {
        self.0.next_sibling().map(Node)
    }
    fn prev(&self) -> Option<Self> {
        self.0.previous_sibling().map(Node)
    }
    // fn next_all(&self) -> impl Iterator<Item = Self> { }
    // fn prev_all(&self) -> impl Iterator<Item = Self> {}
    fn is_named(&self) -> bool {
        self.0.is_named()
    }
    /// N.B. it is different from is_named && is_leaf
    /// if a node has no named children.
    fn is_named_leaf(&self) -> bool {
        self.0.named_child_count() == 0
    }
    fn is_leaf(&self) -> bool {
        self.0.child_count() == 0
    }
    fn kind(&self) -> Cow<str> {
        Cow::Owned(self.0.type_().into())
    }
    fn kind_id(&self) -> u16 {
        self.0.type_id()
    }
    fn node_id(&self) -> usize {
        self.0.id() as usize
    }
    fn range(&self) -> std::ops::Range<usize> {
        (self.0.start_index() as usize)..(self.0.end_index() as usize)
    }
    fn start_pos(&self) -> Position {
        let start = self.0.start_position();
        let offset = self.0.start_index();
        Position::new(
            start.row() as usize,
            start.column() as usize,
            offset as usize,
        )
    }
    fn end_pos(&self) -> Position {
        let end = self.0.end_position();
        let offset = self.0.end_index();
        Position::new(end.row() as usize, end.column() as usize, offset as usize)
    }
    // missing node is a tree-sitter specific concept
    fn is_missing(&self) -> bool {
        self.0.is_missing()
    }
    fn is_error(&self) -> bool {
        self.0.is_error()
    }

    fn field(&self, name: &str) -> Option<Self> {
        self.0.child_for_field_name(name).map(Node)
    }
    fn field_children(&self, field_id: Option<u16>) -> impl Iterator<Item = Self> {
        let cursor = self.0.walk();
        cursor.goto_first_child();
        // if field_id is not found, iteration is done
        let mut done = field_id.is_none();

        std::iter::from_fn(move || {
            if done {
                return None;
            }
            while cursor.current_field_id() != field_id {
                if !cursor.goto_next_sibling() {
                    return None;
                }
            }
            let ret = cursor.current_node();
            if !cursor.goto_next_sibling() {
                done = true;
            }
            Some(Node(ret))
        })
    }
}

impl Doc for WasmDoc {
    type Lang = WasmLang;
    type Source = Wrapper;
    type Node<'a> = Node;
    fn get_lang(&self) -> &Self::Lang {
        &self.lang
    }
    fn get_source(&self) -> &Self::Source {
        &self.source
    }
    fn root_node(&self) -> Self::Node<'_> {
        Node(self.tree.root_node())
    }
    fn do_edit(&mut self, edit: &ast_grep_core::source::Edit<Self::Source>) -> Result<(), String> {
        let edit = self.source.accept_edit(edit);
        self.tree.edit(&edit);
        let parser = Parser::new().map_err(|e| e.to_string())?;
        let ast_grep_lang = self.lang.get_ts_language();
        // Convert back to web_tree_sitter_sg::Language for the parser
        let ts_lang = unsafe { convert_to_wasm_lang(ast_grep_lang) };
        parser.set_language(&ts_lang).map_err(|e| e.to_string())?;
        let src = self.source.inner.iter().collect::<String>();
        let parse_ret = parser.parse_with_string(&src.into(), Some(&self.tree), None);
        let Some(tree) = parse_ret.map_err(|e| e.to_string())? else {
            return Err("Failed to parse".to_string());
        };
        self.tree = tree;
        Ok(())
    }
    fn get_node_text<'a>(&'a self, node: &Self::Node<'a>) -> Cow<'a, str> {
        Cow::Owned(node.0.text().into())
    }
}

unsafe fn convert_to_wasm_lang(lang: AstGrepTSLanguage) -> TSLanguage {
    std::mem::transmute(lang)
}

#[allow(unused)]
unsafe fn convert_to_ast_grep_lang(lang: TSLanguage) -> AstGrepTSLanguage {
    std::mem::transmute(lang)
}
