import { deepStrictEqual, ok } from "node:assert";
import { buildApi, executeFilemod } from "@codemod-com/filemod";
import { buildPathAPI, buildUnifiedFileSystem } from "@codemod-com/utilities";
import { fromMarkdown } from "mdast-util-from-markdown";
import { mdxFromMarkdown, mdxToMarkdown } from "mdast-util-mdx";
import { toMarkdown } from "mdast-util-to-markdown";
import type { DirectoryJSON } from "memfs";
import { Volume, createFsFromVolume } from "memfs";
import { mdxjs } from "micromark-extension-mdxjs";
import tsmorph from "ts-morph";
import { visit } from "unist-util-visit";
import { describe, it } from "vitest";
import { repomod } from "../src/index.js";

const INDEX_CONTENT = `
import A from './testQWE';

export default function Index({}) {
	return null;
}
  
export const getStaticProps = async ({}) => {
	return {
		props: {},
	  	revalidate: 10,
	}
}
`;

const A_B_CONTENT = `
import { X } from "../../testABC";
import { Y } from "./testDEF";

export const getStaticPaths = () => {

}
`;

const A_C_CONTENT = `
export const getServerSideProps = () => {

}
`;

const transform = async (json: DirectoryJSON) => {
  const volume = Volume.fromJSON(json);
  const fs = createFsFromVolume(volume);

  const unifiedFileSystem = buildUnifiedFileSystem(fs);
  const pathApi = buildPathAPI("/");

  const parseMdx = (data: string) =>
    fromMarkdown(data, {
      extensions: [mdxjs()],
      mdastExtensions: [mdxFromMarkdown()],
    });

  type Root = ReturnType<typeof fromMarkdown>;

  const stringifyMdx = (tree: Root) =>
    toMarkdown(tree, { extensions: [mdxToMarkdown()] });

  const api = buildApi<{
    tsmorph: typeof tsmorph;
    parseMdx: typeof parseMdx;
    stringifyMdx: typeof stringifyMdx;
    visitMdxAst: typeof visit;
  }>(
    unifiedFileSystem,
    () => ({
      tsmorph,
      parseMdx,
      stringifyMdx,
      visitMdxAst: visit,
    }),
    pathApi,
  );

  return executeFilemod(api, repomod, "/", {}, {});
};

describe("next 13 app-directory-boilerplate", () => {
  it("should build correct files", async () => {
    const externalFileCommands = await transform({
      "C:\\project\\pages\\index.jsx": INDEX_CONTENT,
      "C:\\project\\pages\\_app.jsx": "any",
      "C:\\project\\pages\\app.jsx": "any",
      "C:\\project\\pages\\_document.jsx": "any",
      "C:\\project\\pages\\_error.jsx": "any",
      "C:\\project\\pages\\_404.jsx": "any",
      "C:\\project\\pages\\[a]\\[b].tsx": A_B_CONTENT,
      "C:\\project\\pages\\[a]\\c.tsx": A_C_CONTENT,
      "C:\\project\\pages\\a\\index.tsx": "any",
    });

    deepStrictEqual(externalFileCommands.length, 18);

    ok(
      externalFileCommands.some(
        (command) =>
          command.kind === "deleteFile" &&
          command.path.endsWith("project\\pages\\_app.jsx"),
      ),
    );

    ok(
      externalFileCommands.some(
        (command) =>
          command.kind === "deleteFile" &&
          command.path.endsWith("project\\pages\\_document.jsx"),
      ),
    );

    ok(
      externalFileCommands.some((command) =>
        command.path.endsWith("project\\app\\layout.tsx"),
      ),
    );

    ok(
      externalFileCommands.some((command) =>
        command.path.endsWith("project\\app\\error.tsx"),
      ),
    );

    ok(
      externalFileCommands.some((command) =>
        command.path.endsWith("project\\app\\not-found.tsx"),
      ),
    );

    ok(
      externalFileCommands.some((command) =>
        command.path.endsWith("project\\app\\page.tsx"),
      ),
    );

    ok(
      externalFileCommands.some((command) =>
        command.path.endsWith("project\\app\\[a]\\[b]\\page.tsx"),
      ),
    );

    ok(
      externalFileCommands.some((command) =>
        command.path.endsWith("project\\app\\[a]\\c\\page.tsx"),
      ),
    );

    ok(
      externalFileCommands.some((command) =>
        command.path.endsWith("project\\app\\a\\page.tsx"),
      ),
    );

    ok(
      externalFileCommands.some((command) => {
        return (
          command.kind === "upsertFile" &&
          command.path.endsWith("project\\app\\components.tsx") &&
          command.newData
            .replace(/\/\/ This file has been sourced from.*\n/g, "")
            .replace(/\W/gm, "") ===
            `
	        'use client';

	        export default function Index({}) {
	            return null;
	        }
	    ;`.replace(/\W/gm, "")
        );
      }),
    );

    ok(
      externalFileCommands.some((command) => {
        return (
          command.kind === "upsertFile" &&
          command.path.endsWith("project\\app\\[a]\\c\\page.tsx") &&
          command.newData
            .replace(/\/\/ This file has been sourced from.*\n/g, "")
            .replace(/\W/gm, "") ===
            `
	            import Components from "./components";
	            // TODO reimplement getServerSideProps with custom logic
	            const getServerSideProps = () => {
	            };
	            export default async function Page(props: any) {
	                return <Components {...props}/>;
	            }
	        `.replace(/\W/gm, "")
        );
      }),
    );

    ok(
      externalFileCommands.some((command) => {
        return (
          command.kind === "upsertFile" &&
          command.path.endsWith("project\\app\\[a]\\[b]\\components.tsx") &&
          command.newData
            .replace(/\/\/ This file has been sourced from.*\n/g, "")
            .replace(/\W/gm, "") ===
            `
	            'use client';
	            `.replace(/\W/gm, "")
        );
      }),
    );
  });
});
