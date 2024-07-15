import {
  type ProjectDownloadInput,
  getCodemodProjectFiles,
  isTypeScriptProjectFiles,
} from "@codemod-com/utilities";
import initSwc, { transform } from "@swc/wasm-web";
import JSZip from "jszip";
import { transpileTs } from "./transpileTs";

export const downloadProject = async (input: ProjectDownloadInput) => {
  const zip = new JSZip();

  const files = getCodemodProjectFiles(input);
  for (const [name, content] of Object.entries(files)) {
    if (name !== "src/index.ts") {
      zip.file(name, content);
    }
  }

  // Pre-built file
  if (isTypeScriptProjectFiles(files)) {
    const { transpiled, source } = await transpileTs(files["src/index.ts"]);
    zip.file(
      "dist/index.cjs",
      `/*! @license\n${files.LICENSE}\n*/\n${transpiled}`,
    );
    zip.file("src/index.ts", source);
  }
  const blob = await zip.generateAsync({ type: "blob" });

  // download hack
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = `${input.name}.zip`;
  link.click();
  window.URL.revokeObjectURL(link.href);
};
