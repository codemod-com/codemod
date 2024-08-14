import {
  type CodemodProjectOutput,
  type ProjectDownloadInput,
  getCodemodProjectFiles,
  isTypeScriptProjectFiles,
} from "@codemod-com/utilities";
import JSZip from "jszip";
import { transpileTs } from "./transpileTs";

export const buildCodemodArchive = async (files: CodemodProjectOutput) => {
  const zip = new JSZip();

  for (const [name, content] of Object.entries(files)) {
    if (name !== "src/index.ts") {
      zip.file(name, content);
    }
  }

  // Pre-built file
  if (isTypeScriptProjectFiles(files)) {
    const { transpiled, source } = await transpileTs(files["src/index.ts"]);

    zip.file(
      "cdmd_dist/index.cjs",
      `/*! @license\n${files.LICENSE}\n*/\n${transpiled}`,
    );
    zip.file("src/index.ts", source);
  }

  return zip.generateAsync({ type: "blob" });
};

export const downloadProject = async (input: ProjectDownloadInput) => {
  const files = getCodemodProjectFiles(input);
  const archive = await buildCodemodArchive(files);

  // download hack
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(archive);
  link.download = `${input.name}.zip`;
  link.click();
  window.URL.revokeObjectURL(link.href);
};
