import type { Api } from "@codemod.com/workflow";

export async function workflow({ files }: Api) {
  const prompt = `
    You are migrating from axios to fetch.
    Ignore axios.create() and axios.all().

    Here is a general pattern to replace axios with fetch:
    1. Replace axios.anyFunction(url) with fetch(url, options) and await it.
    2. if response.ok is false, throw an error.
    3. Get the response by calling response.json() or response.text() or response.blob() or response.arrayBuffer().
    4. To be compatible with axios, you need to need to set result variable to { data: await response.json() }.
    5. Infer the type of result variable from context and apply type to resulve variable { data: await response.json() as SomeType }.

    Use AbortSignal to replace axios timeout option.
    For example,
      axios.get(url, { timeout: 5000 })
    can be replaced with
      fetch(url, { signal: AbortSignal.timeout(5000) })
  `;

  const axiosPatterns = [
    { pattern: "axios($$$_)" }, // axios()
    { pattern: "axios.$_($$$)" }, // axios.get(...)
    { pattern: "axios.$_($$$).$_($$$)" }, // axios.get(...).then(...)
    { pattern: "axios.$_($$$).$_($$$).$_($$$)" }, // axios.get(...).then(...).catch(...)
    { pattern: "axios.$_($$$).$_($$$).$_($$$).$_($$$)" }, // axios.get(...).then(...).catch(...).finally(...)
  ];

  const extendAxiosPatterns = (extend: (pattern: string) => string) =>
    axiosPatterns.map(({ pattern }) => ({
      pattern: extend(pattern),
    }));

  await files()
    .jsFam()
    .astGrep({
      rule: {
        any: [
          ...extendAxiosPatterns(
            (pattern) => `const $CONSTANT = await ${pattern}`,
          ),
          ...extendAxiosPatterns(
            (pattern) => `let $VARIABLE = await ${pattern}`,
          ),
          ...extendAxiosPatterns(
            (pattern) => `var $VARIABLE = await ${pattern}`,
          ),
          ...extendAxiosPatterns(
            (pattern) => `const { $$$_ } = await ${pattern}`,
          ),
          ...extendAxiosPatterns(
            (pattern) => `let { $$$_ } = await ${pattern}`,
          ),
          ...extendAxiosPatterns(
            (pattern) => `var { $$$_ } = await ${pattern}`,
          ),
          ...extendAxiosPatterns(
            (pattern) => `const [ $$$_ ] = await ${pattern}`,
          ),
          ...extendAxiosPatterns(
            (pattern) => `let [ $$$_ ] = await ${pattern}`,
          ),
          ...extendAxiosPatterns(
            (pattern) => `var [ $$$_ ] = await ${pattern}`,
          ),
          ...extendAxiosPatterns((pattern) => `$_ = await ${pattern}`),
          ...extendAxiosPatterns((pattern) => `return await ${pattern}`),
        ],
      },
    })
    .ai(prompt);

  await files()
    .jsFam()
    .astGrep({ rule: { any: axiosPatterns } })
    .ai(prompt);
}
