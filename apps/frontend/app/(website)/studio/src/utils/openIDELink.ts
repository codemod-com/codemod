import type { CURSOR_PREFIX, VSCODE_PREFIX } from "@/constants";
import { openLink } from "@/utils";
import { populateLoginIntent } from "../api/populateLoginIntent";
import { SEARCH_PARAMS_KEYS } from "../store/getInitialState";

export const openIDELink = async (
  clerkToken: string,
  deepLinkPrefix: typeof VSCODE_PREFIX | typeof CURSOR_PREFIX,
): Promise<void> => {
  const accessTokenEither = await populateLoginIntent({
    clerkToken,
  });
  if (accessTokenEither.isLeft()) {
    console.error(accessTokenEither.getLeft());
    return;
  }
  const accessToken = accessTokenEither.get();
  const deepLink = new URL(
    `${deepLinkPrefix}codemod.codemod-vscode-extension/`,
  );
  const searchParams = new URLSearchParams();

  searchParams.set(SEARCH_PARAMS_KEYS.ACCESS_TOKEN, accessToken);
  deepLink.search = searchParams.toString();
  openLink(deepLink.toString());
};
