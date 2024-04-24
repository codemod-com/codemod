import type { Uri } from "vscode";
import { buildHash } from "../utilities";
import type { UriHash } from "./types";

export const buildUriHash = (uri: Pick<Uri, "toString">): UriHash => {
  return buildHash(uri.toString()) as UriHash;
};
