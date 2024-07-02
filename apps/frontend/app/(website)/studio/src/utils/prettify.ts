function promiseState<T>(p: Promise<T>) {
  let state: T | undefined;

  p.then((resolved) => {
    state = resolved;
  });

  return () => state;
}

const getPrettier = promiseState(import("prettier/standalone"));
const getPrettierParserTypeScript = promiseState(
  import("prettier/parser-typescript"),
);

export const prettify = (text: string): string => {
  const prettier = getPrettier();
  const prettierParserTypeScript = getPrettierParserTypeScript();

  if (prettier === undefined || prettierParserTypeScript === undefined) {
    return text;
  }

  try {
    return prettier.format(text, {
      semi: true,
      singleQuote: true,
      jsxSingleQuote: true,
      trailingComma: "all",
      parser: "typescript",
      tabWidth: 4,
      plugins: [prettierParserTypeScript],
    });
  } catch (error) {
    console.error(error);

    return text;
  }
};
