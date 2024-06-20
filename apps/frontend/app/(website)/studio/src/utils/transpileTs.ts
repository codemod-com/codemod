import initSwc, { transform } from "@swc/wasm-web";

export const transpileTs = async (input: string) => {
	await initSwc();
	const { code } = await transform(input, {
		minify: true,
		module: { type: "commonjs" },
		jsc: {
			target: "es5",
			loose: false,
			parser: { syntax: "typescript", tsx: true },
		},
	});

	return code;
};
