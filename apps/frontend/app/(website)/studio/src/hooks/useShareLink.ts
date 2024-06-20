import { useAuth } from "@clerk/nextjs";
// import { encode } from "universal-base64url";
import sendMessage from "@studio/api/sendMessage";
// import type { ShareableCodemod } from "@studio/schemata/shareableCodemodSchemata";
import { SEARCH_PARAMS_KEYS } from "@studio/store/getInitialState";
import { generateCodemodNamePrompt } from "@studio/store/zustand/CFS/prompts";
import { useModStore } from "@studio/store/zustand/mod";
import { useSnippetStore } from "@studio/store/zustand/snippets";
import { deflate } from "pako";

export let useShareLink = () => {
  let { engine, inputSnippet, outputSnippet } = useSnippetStore();
  let { internalContent } = useModStore();
  let { getToken } = useAuth();

  // const getExtensionUrl = async (): Promise<URL | null> => {
  // 	try {
  // 		if (internalContent === null) {
  // 			throw new Error("codemod content not found");
  // 		}

  // 		const token = await getToken();

  // 		let codemodName = "untitled";
  // 		if (token !== null) {
  // 			// Ask LLM to come up with a name for the given codemod
  // 			const codemodNameOrError = await sendMessage({
  // 				message: generateCodemodNamePrompt(internalContent),
  // 				token,
  // 			});

  // 			if (codemodNameOrError.isLeft()) {
  // 				console.error(codemodNameOrError.getLeft());
  // 			} else {
  // 				codemodName = codemodNameOrError.get().text;
  // 			}
  // 		}

  // 		const searchParams = new URLSearchParams();
  // 		searchParams.set(SEARCH_PARAMS_KEYS.ENGINE, encode(engine));
  // 		searchParams.set(SEARCH_PARAMS_KEYS.BEFORE_SNIPPET, encode(inputSnippet));
  // 		searchParams.set(SEARCH_PARAMS_KEYS.AFTER_SNIPPET, encode(outputSnippet));
  // 		searchParams.set(
  // 			SEARCH_PARAMS_KEYS.CODEMOD_SOURCE,
  // 			encode(internalContent ?? ""),
  // 		);
  // 		searchParams.set(SEARCH_PARAMS_KEYS.CODEMOD_NAME, encode(codemodName));

  // 		const url = new URL(window.location.href);
  // 		url.search = searchParams.toString();

  // 		return url;
  // 	} catch (error) {
  // 		console.error(error);

  // 		return null;
  // 	}
  // };

  let getURL = async (): Promise<URL | null> => {
    try {
      if (internalContent === null) {
        throw new Error("codemod content not found");
      }

      let token = await getToken();

      let codemodName = "untitled";
      if (token !== null) {
        // Ask LLM to come up with a name for the given codemod
        let codemodNameOrError = await sendMessage({
          message: generateCodemodNamePrompt(internalContent),
          token,
        });

        if (codemodNameOrError.isLeft()) {
          console.error(codemodNameOrError.getLeft());
        } else {
          codemodName = codemodNameOrError.get().text;
        }
      }

      let input = JSON.stringify({
        v: 1, // version
        e: engine,
        n: codemodName,
        b: inputSnippet,
        a: outputSnippet,
        c: internalContent ?? "",
      }); //satisfies ShareableCodemod);

      let uint8array = deflate(input, { level: 9 });

      let output = window
        .btoa(
          Array.from(uint8array, (uint8) => String.fromCodePoint(uint8)).join(
            "",
          ),
        )
        .replaceAll("=", "")
        .replaceAll("/", "_")
        .replaceAll("+", "-");

      let searchParams = new URLSearchParams({
        [SEARCH_PARAMS_KEYS.COMPRESSED_SHAREABLE_CODEMOD]: output,
      });

      let url = new URL(window.location.href);
      url.search = searchParams.toString();

      return url;
    } catch (error) {
      console.error(error);

      return null;
    }
  };

  // return { getURL, getExtensionUrl };
  return { getURL };
};
