import { isServer } from "@studio/config";
import { SEARCH_PARAMS_KEYS } from "@studio/store/initialState";
import { useModStore } from "@studio/store/mod";
import { useSnippetsStore } from "@studio/store/snippets";
import { deflate } from "pako";

export const useShareLink = () => {
  const { engine, getSelectedEditors, getAllSnippets, getAllNames } =
    useSnippetsStore();
  const { content } = useModStore();

  const getURL = (): URL | null => {
    try {
      if (content === null) {
        throw new Error("codemod content not found");
      }

      const codemodName = "untitled";

      const input = JSON.stringify({
        v: 1, // version
        e: engine,
        n: codemodName,
        b: getSelectedEditors().beforeSnippet,
        a: getSelectedEditors().afterSnippet,
        bm: getAllSnippets().before.join("__codemod_splitter__"),
        am: getAllSnippets().after.join("__codemod_splitter__"),
        nm: getAllNames().join("__codemod_splitter__"),
        c: content ?? "",
      });

      const uint8array = deflate(input, { level: 9 });

      const output = window
        .btoa(
          Array.from(uint8array, (uint8) => String.fromCodePoint(uint8)).join(
            "",
          ),
        )
        .replaceAll("=", "")
        .replaceAll("/", "_")
        .replaceAll("+", "-");

      const searchParams = new URLSearchParams({
        [SEARCH_PARAMS_KEYS.COMPRESSED_SHAREABLE_CODEMOD]: output,
      });

      if (isServer) return new URL("");
      const url = new URL(window.location.href);
      url.search = searchParams.toString();

      return url;
    } catch (error) {
      console.error(error);

      return null;
    }
  };

  return { getURL };
};
