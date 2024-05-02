import { createHash } from "node:crypto";
import { sep } from "node:path";
import * as t from "io-ts";
import { Project } from "ts-morph";
import { Uri, type Webview } from "vscode";
import {
  ACCESS_TOKEN_REQUESTED_BY_CURSOR_STORAGE_KEY,
  ACCESS_TOKEN_REQUESTED_BY_VSCE_STORAGE_KEY,
  CURSOR_PREFIX,
  VSCODE_PREFIX,
} from "./constants";
import type { _ExplorerNode } from "./persistedState/explorerNodeCodec";

export function isNeitherNullNorUndefined<T>(value: T): value is T & {} {
  return value !== null && value !== undefined;
}

export function assertsNeitherNullOrUndefined<T>(
  value: T,
): asserts value is T & {} {
  if (value === null || value === undefined) {
    throw new Error("The value cannot be null or undefined");
  }
}

export const buildHash = (data: string) =>
  createHash("ripemd160").update(data).digest("base64url");

export const buildTypeCodec = <T extends t.Props>(
  props: T,
): t.ReadonlyC<t.ExactC<t.TypeC<T>>> => t.readonly(t.exact(t.type(props)));

export const debounce = <R>(callback: (...args: any[]) => R, ms: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: any[]) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => callback(...args), ms);
  };
};

export const timeout = (ms: number) =>
  new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error("Timeout while looking for a git repository")),
      ms,
    ),
  );

export const singleQuotify = (str: string) => `'${str}'`;
export const doubleQuotify = (str: string) => `"${str}"`;

export const buildCrossplatformArg = (str: string) => {
  const isWin = process.platform === "win32";
  // remove trailing "\"
  return isWin ? doubleQuotify(str.replace(/\\+$/, "")) : singleQuotify(str);
};

export function getUri(
  webview: Webview,
  extensionUri: Uri,
  pathList: string[],
) {
  return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
}

export const capitalize = (str: string): string => {
  if (!str) {
    return "";
  }

  return str.charAt(0).toUpperCase() + str.slice(1);
};

// taken from https://stackoverflow.com/a/63361543
export const streamToString = async (stream: NodeJS.ReadableStream) => {
  const chunks = [];

  for await (const chunk of stream) {
    if (chunk instanceof Buffer) {
      chunks.push(chunk);
      continue;
    }

    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf-8");
};

export const buildCodemodMetadataHash = (name: string) =>
  createHash("ripemd160").update("README.md").update(name).digest("base64url");

export const findParentExplorerNode = (
  index: number,
  explorerNodes: _ExplorerNode[],
): { node: _ExplorerNode; index: number } | null => {
  const explorerNode = explorerNodes[index] ?? null;
  if (explorerNode === null) {
    return null;
  }

  for (let i = index - 1; i >= 0; i--) {
    const node = explorerNodes[i] ?? null;

    if (node === null) {
      return null;
    }

    if (node.depth < explorerNode.depth) {
      return { node, index: i };
    }
  }
  return null;
};

// remove all special characters and whitespace
export const removeSpecialCharacters = (str: string) =>
  str.replace(/[{}()[\]:;,/?'"<>|=`!]/g, "").replace(/\s/g, "");

export const removeLineBreaksAtStartAndEnd = (str: string) =>
  str
    .replace(/^\n+/, "") // remove all occurrences of `\n` at the start
    .replace(/\n+$/, ""); // remove all occurrences of `\n` at the end

export const createInMemorySourceFile = (filePath: string, content: string) => {
  const project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: {
      allowJs: true,
    },
  });

  return project.createSourceFile(filePath, content);
};

export const buildGlobPattern = (targetUri: Uri, pattern?: string) => {
  const { fsPath: targetUriFsPath } = targetUri;

  // Glob patterns should always use / as a path separator, even on Windows systems, as \ is used to escape glob characters.
  const pathParts = targetUriFsPath.split(sep);

  pathParts.push(pattern ?? "");

  return pathParts.join("/");
};

export const getDeepLinkPrefix = () => {
  if (process.env.VSCODE_PID) {
    return VSCODE_PREFIX;
  }
  return CURSOR_PREFIX;
};

export const getDeepLinkAccessTokenParam = () => {
  if (process.env.VSCODE_PID) {
    return ACCESS_TOKEN_REQUESTED_BY_VSCE_STORAGE_KEY;
  }
  return ACCESS_TOKEN_REQUESTED_BY_CURSOR_STORAGE_KEY;
};
