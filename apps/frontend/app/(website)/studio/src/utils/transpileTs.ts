import initSwc, { transform } from "@swc/wasm-web";

export const transpileTs = async (input: string) => {
  await initSwc();
  const { code } = await transform(
    // TODO: temporary fix, most likely we need to upgrade monaco editor or babel or whatever is responsible
    // for taking the code from the web-editor and converting it to string
    input.replace(/\n *as\n *const/g, " as const"),
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

  return code;
};
