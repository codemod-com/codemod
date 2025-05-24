use std::sync::Arc;
use swc_core::{
    common::{FileName, SourceMap},
    ecma::{
        ast::EsVersion,
        codegen::{text_writer::JsWriter, Config as JsCodegenConfig, Emitter},
        parser::{lexer::Lexer, Parser, StringInput, Syntax, TsSyntax},
        transforms::typescript::strip_type,
        visit::VisitMutWith,
    },
};

pub fn transpile(source: String) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
    // Create source map
    let cm: Arc<SourceMap> = Default::default();

    // Create a source file
    let fm = cm.new_source_file(FileName::Anon.into(), source);

    // Set up TypeScript syntax parser
    let mut parser = Parser::new_from(Lexer::new(
        Syntax::Typescript(TsSyntax {
            tsx: true,
            decorators: true,
            ..Default::default()
        }),
        EsVersion::latest(),
        StringInput::from(&*fm),
        None,
    ));

    // Parse the TypeScript code
    let mut program = parser
        .parse_program()
        .map_err(|err| format!("Failed to parse TypeScript: {:?}", err))?;

    // Strip TypeScript types to convert to JavaScript
    program.visit_mut_with(&mut strip_type());

    // Generate JavaScript code
    let mut buf = vec![];
    {
        let mut emitter = Emitter {
            cfg: JsCodegenConfig::default()
                .with_target(EsVersion::Es2015)
                .with_omit_last_semi(false),
            cm: cm.clone(),
            comments: None,
            wr: Box::new(JsWriter::new(cm.clone(), "\n", &mut buf, None)),
        };

        emitter
            .emit_program(&program)
            .map_err(|err| format!("Failed to emit JavaScript: {}", err))?;
    }

    Ok(buf)
}
