import { LEARN_KEY } from "@/constants";
import type { KnownEngines } from "@codemod-com/utilities";
import { getCodeDiff } from "@studio/api/getCodeDiff";
import { parseShareableCodemod } from "@studio/schemata/shareableCodemodSchemata";
import { SEARCH_PARAMS_KEYS } from "@studio/store/initialState";
import { useModStore } from "@studio/store/mod";
import { useSnippetsStore } from "@studio/store/snippets";
import {
  getEmptyTestCase,
  toInitialStates,
} from "@studio/store/utils/getSnippetInitialState";
import { isNeitherNullNorUndefined } from "@studio/utils/isNeitherNullNorUndefined";
import { inflate } from "pako";
import { zipWith } from "ramda";
import { useEffect } from "react";
import { decode } from "universal-base64url";

const decodeNullable = (value: string | null): string | null => {
  if (value === null) {
    return value;
  }

  try {
    return decode(value);
  } catch (error) {
    return value;
  }
};
const getState = () => {
  const searchParams = new URLSearchParams(window.location.search);

  const csc = searchParams.get(SEARCH_PARAMS_KEYS.COMPRESSED_SHAREABLE_CODEMOD);
  if (csc === null) return;

  try {
    const encryptedString = window.atob(
      csc.replaceAll("-", "+").replaceAll("_", "/"),
    );

    const numberArray = Array.from(encryptedString)
      .map((character) => character.codePointAt(0))
      .filter(isNeitherNullNorUndefined);

    const uint8Array = Uint8Array.from(numberArray);

    const decryptedString = inflate(uint8Array, { to: "string" });
    const shareableCodemod = parseShareableCodemod(JSON.parse(decryptedString));

    const getMultipleEditors = ({
      before,
      after,
      names,
    }: {
      before: string[];
      after: string[];
      names: string[];
    }) => {
      const zipit = zipWith((before, after) => ({ before, after }));
      const zipitMore = zipWith(({ before, after }, name) => ({
        before,
        after,
        name: name ?? "test",
      }));
      return zipitMore(zipit(before, after), names);
    };

    const editors = shareableCodemod.bm
      ? getMultipleEditors({
          before: shareableCodemod.bm.split("__codemod_splitter__"),
          after: shareableCodemod.am.split("__codemod_splitter__"),
          names: shareableCodemod.nm.split("__codemod_splitter__"),
        })
      : [
          {
            name: "test 1",
            before: shareableCodemod.b ?? "",
            after: shareableCodemod.a ?? "",
          },
        ];
    return {
      engine: shareableCodemod.e ?? "jscodeshift",
      editors: editors.map(toInitialStates),
      codemodSource: shareableCodemod.c ?? "",
      codemodName: shareableCodemod.n ?? null,
      command: null,
    };
  } catch (error) {
    console.error(error);
  }

  const engine = decodeNullable(
    searchParams.get(SEARCH_PARAMS_KEYS.ENGINE),
  ) as KnownEngines;
  const diffId = searchParams.get(SEARCH_PARAMS_KEYS.DIFF_ID);
  const codemodSource = decodeNullable(
    searchParams.get(SEARCH_PARAMS_KEYS.CODEMOD_SOURCE),
  );
  const codemodName = decodeNullable(
    searchParams.get(SEARCH_PARAMS_KEYS.CODEMOD_NAME),
  );

  const command = searchParams.get(SEARCH_PARAMS_KEYS.COMMAND);

  const someSearchParamsSet = [
    engine,
    diffId,
    codemodSource,
    codemodName,
    command,
  ].some((s) => s !== null);

  if (someSearchParamsSet) {
    return {
      engine: engine ?? "jscodeshift",
      editors: [getEmptyTestCase()],
      codemodSource: codemodSource ?? "",
      codemodName: codemodName ?? "",
      command:
        command === "learn" || command === "accessTokenRequested"
          ? command
          : null,
    };
  }
};

const useCodemodLearn = () => {};
export const useSharedState = () => {
  const { setInitialState, getSelectedEditors, setEngine } = useSnippetsStore();
  const { setContent, setCurrentCommand } = useModStore();
  const searchParams = new URLSearchParams(window.location.search);
  const command = searchParams.get(SEARCH_PARAMS_KEYS.COMMAND);

  useEffect(() => {
    const initialState = getState();
    const snippetStore = getSelectedEditors();
    if (command === LEARN_KEY) {
      (async () => {
        try {
          const engine = (searchParams.get(SEARCH_PARAMS_KEYS.ENGINE) ??
            "jscodeshift") as KnownEngines;
          const diffId = searchParams.get(SEARCH_PARAMS_KEYS.DIFF_ID);
          const iv = searchParams.get(SEARCH_PARAMS_KEYS.IV);
          if (!engine || !diffId || !iv) {
            return;
          }

          const snippets = await getCodeDiff({ diffId, iv });

          if (!snippets) {
            return;
          }

          snippetStore.setBeforeSnippet(snippets.before);
          snippetStore.setAfterSnippet(snippets.after);
          searchParams.delete(SEARCH_PARAMS_KEYS.COMMAND);
          setEngine(engine);
          setCurrentCommand(LEARN_KEY);
        } catch (err) {
          console.error(err);
        }
      })();
      return;
    }
    if (initialState) {
      setInitialState(initialState);
      setContent(initialState.codemodSource);
    }
  }, []);
};
