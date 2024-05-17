import { prettify } from "./prettify";

let CommentForGeneratedOutput = `
//// Generated Output from CFS ////
`;

let CommentForEndOfGeneratedOutput = `
//// End of Generated Output from CFS ////
`;
export let injectCFSOutputToCodemod = (
  codemod?: string,
  cfsOutput?: string,
) => {
  if (!cfsOutput) return null;
  if (!codemod) return null;
  let match = codemod.match(/const root(.*)\n/g);

  if (match?.[0]) {
    let firstMatch = match[0];
    let firstMatchIndex = codemod.indexOf(firstMatch);
    let beforeContent = codemod.slice(0, firstMatchIndex + firstMatch.length);
    let afterContent = codemod.slice(firstMatchIndex + firstMatch.length);
    let newContent = `${beforeContent}${CommentForGeneratedOutput}${cfsOutput}${CommentForEndOfGeneratedOutput}${afterContent}`;
    return prettify(newContent);
  }
  return null;
};
