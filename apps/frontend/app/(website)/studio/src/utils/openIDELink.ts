import type { CURSOR_PREFIX, VSCODE_PREFIX } from "@/constants";
import { openLink } from "@/utils";
import getAccessToken from "../api/getAccessToken";
import { SEARCH_PARAMS_KEYS } from "../store/getInitialState";

export let openIDELink = async (
  clerkToken: string,
  deepLinkPrefix: typeof VSCODE_PREFIX | typeof CURSOR_PREFIX,
): Promise<void> => {
  let accessTokenEither = await getAccessToken({
    clerkToken,
  });
  if (accessTokenEither.isLeft()) {
    console.error(accessTokenEither.getLeft());
    return;
  }
  let accessToken = accessTokenEither.get();
  let deepLink = new URL(
    `${deepLinkPrefix}codemod.codemod-vscode-extension/`,
  );
  let searchParams = new URLSearchParams();

  searchParams.set(SEARCH_PARAMS_KEYS.ACCESS_TOKEN, accessToken);
  deepLink.search = searchParams.toString();
  openLink(deepLink.toString());
};
