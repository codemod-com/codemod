import esbuild from 'esbuild';

const getOptions = (fileName: string): Parameters<typeof esbuild.build>[0] => {
	return {
		entryPoints: [`${fileName}.ts`],
		banner: {
			js: `
        // BANNER START
        const require = (await import("node:module")).createRequire(import.meta.url);
        const __filename = (await import("node:url")).fileURLToPath(import.meta.url);
        const __dirname = (await import("node:path")).dirname(__filename);
        // BANNER END
      `,
		},
		bundle: true,
		platform: 'node',
		minify: true,
		minifyWhitespace: true,
		format: 'esm',
		outfile: `./dist/${fileName}.js`,
	};
};

const build = async () => {
	await esbuild.build(getOptions('parse'));
	await esbuild.build(getOptions('sync'));
};

build();
