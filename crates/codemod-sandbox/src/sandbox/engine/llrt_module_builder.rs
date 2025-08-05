use llrt_modules::module_builder::ModuleBuilder;
use llrt_modules::{
    abort, assert, buffer, child_process, console, crypto, events, exceptions, fetch, fs, os, path,
    perf_hooks, process, stream_web, string_decoder, timers, tty, url, util, zlib,
};

pub const UNSAFE_MODULES: &[&str] = &["fetch", "child_process", "fs"];

pub struct LlrtModuleBuilder {
    pub builder: ModuleBuilder,
}

impl LlrtModuleBuilder {
    pub fn build() -> Self {
        let mut module_builder = ModuleBuilder::new();

        module_builder = module_builder.with_global(abort::init);

        module_builder = module_builder.with_module(assert::AssertModule);

        module_builder = module_builder.with_global(buffer::init);
        module_builder = module_builder.with_module(buffer::BufferModule);

        module_builder = module_builder.with_global(console::init);
        module_builder = module_builder.with_module(console::ConsoleModule);

        module_builder = module_builder.with_global(crypto::init);
        module_builder = module_builder.with_module(crypto::CryptoModule);

        module_builder = module_builder.with_global(events::init);
        module_builder = module_builder.with_module(events::EventsModule);

        module_builder = module_builder.with_global(exceptions::init);

        module_builder = module_builder.with_module(os::OsModule);

        module_builder = module_builder.with_module(path::PathModule);

        module_builder = module_builder.with_global(perf_hooks::init);
        module_builder = module_builder.with_module(perf_hooks::PerfHooksModule);

        module_builder = module_builder.with_global(process::init);
        module_builder = module_builder.with_module(process::ProcessModule);

        module_builder = module_builder.with_global(stream_web::init);
        module_builder = module_builder.with_module(stream_web::StreamWebModule);

        module_builder = module_builder.with_module(string_decoder::StringDecoderModule);

        module_builder = module_builder.with_global(timers::init);
        module_builder = module_builder.with_module(timers::TimersModule);

        module_builder = module_builder.with_module(tty::TtyModule);

        module_builder = module_builder.with_global(url::init);
        module_builder = module_builder.with_module(url::UrlModule);

        module_builder = module_builder.with_global(util::init);
        module_builder = module_builder.with_module(util::UtilModule);

        module_builder = module_builder.with_module(zlib::ZlibModule);

        Self {
            builder: module_builder,
        }
    }

    pub fn enable_fetch(&mut self) -> &mut Self {
        let builder = std::mem::take(&mut self.builder);
        self.builder = builder.with_global(fetch::init);
        self
    }

    pub fn enable_fs(&mut self) -> &mut Self {
        let builder = std::mem::take(&mut self.builder);
        self.builder = builder
            .with_module(fs::FsPromisesModule)
            .with_module(fs::FsModule);
        self
    }

    pub fn enable_child_process(&mut self) -> &mut Self {
        let builder = std::mem::take(&mut self.builder);
        self.builder = builder.with_module(child_process::ChildProcessModule);
        self
    }
}
