export const buildCodemodSlug = (name: string) =>
  name
    .replaceAll("@", "")
    .split(/[\/ ,.-]/)
    .join("-");
