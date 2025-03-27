import initSwc, { transform } from "@swc/wasm-web";

export const transpileTs = async (input: string) => {
  await initSwc();

  const source = input.replace(/\n *as\n *const/g, " as const");
  const { code: transpiled } = await transform(
    // TODO: temporary fix, most likely we need to upgrade monaco editor or babel or whatever is responsible
    // for taking the code from the web-editor and converting it to string
    source,
    {
      minify: true,
      module: { type: "commonjs" },
      jsc: {
        target: "es2022",
        loose: false,
        parser: { syntax: "typescript", tsx: true },
      },
    },
  );

  return { source, transpiled };
};
