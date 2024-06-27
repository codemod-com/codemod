import {
  type CodemodDownloadLinkResponse,
  type CodemodListResponse,
  type GetScopedTokenResponse,
  type GetUserDataResponse,
  type VerifyTokenResponse,
  extendedFetch,
} from "@codemod-com/utilities";
import type FormData from "form-data";

export const getCLIAccessToken = async (accessToken: string) => {
  const url = new URL(`${process.env.AUTH_BACKEND_URL}/appToken`);

  const response = await extendedFetch(url.toString(), {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(10000),
  });

  return (await response.json()) as GetScopedTokenResponse;
};

export const validateCLIToken = async (accessToken: string) => {
  const response = await extendedFetch(
    `${process.env.AUTH_BACKEND_URL}/verifyToken`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(10000),
    },
  );

  return (await response.json()) as VerifyTokenResponse;
};

export const getUserData = async (accessToken: string) => {
  try {
    const response = await extendedFetch(
      `${process.env.AUTH_BACKEND_URL}/userData`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(5000),
      },
    );

    const data = (await response.json()) as GetUserDataResponse;

    if (!("user" in data)) {
      return null;
    }

    return data;
  } catch (err) {
    return null;
  }
};

export const publish = async (accessToken: string, formData: FormData) => {
  await extendedFetch(`${process.env.BACKEND_URL}/publish`, {
    method: "POST",
    body: formData as any,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "multipart/form-data",
    },
    signal: AbortSignal.timeout(10000),
  });
};

export const unpublish = async (accessToken: string, name: string) => {
  await extendedFetch(`${process.env.BACKEND_URL}/unpublish`, {
    method: "POST",
    body: JSON.stringify({ name }),
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(10000),
  });
};

// @TODO
export const revokeCLIToken = async (accessToken: string): Promise<void> => {
  return void 0;
  // await Axios.delete(`${process.env.BACKEND_URL}/revokeToken`, {
  //   headers: { Authorization: `Bearer ${accessToken}` },
  //   timeout: 10000,
  // });
};

export const getCodemodDownloadURI = async (
  name: string,
  accessToken?: string,
) => {
  const url = new URL(`${process.env.BACKEND_URL}/codemods/downloadLink`);
  if (name) {
    url.searchParams.set("name", name);
  }

  const headers = new Headers();
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await extendedFetch(url.toString(), {
    headers,
    signal: AbortSignal.timeout(10000),
  });

  return (await response.json()) as CodemodDownloadLinkResponse;
};

export const getCodemodList = async (options?: {
  accessToken?: string;
  search?: string | null;
}) => {
  const { accessToken, search } = options ?? {};

  const headers = new Headers();
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const url = new URL(`${process.env.BACKEND_URL}/codemods/list`);
  if (search) {
    url.searchParams.set("search", search);
  }

  const response = await extendedFetch(url.toString(), {
    headers,
    signal: AbortSignal.timeout(10000),
  });

  return (await response.json()) as CodemodListResponse;
};

type UserLoginIntentResponse = {
  id: string;
  iv: string;
};
export const generateUserLoginIntent = async () => {
  const response = await extendedFetch(
    `${process.env.AUTH_BACKEND_URL}/intents`,
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );

  return (await response.json()) as UserLoginIntentResponse;
};

type ConfirmUserLoggedInResponse = {
  token: string;
};
export const confirmUserLoggedIn = async (sessionId: string, iv: string) => {
  const response = await extendedFetch(
    `${process.env.AUTH_BACKEND_URL}/intents/${sessionId}?iv=${iv}`,
  );

  const data = (await response.json()) as ConfirmUserLoggedInResponse;
  return data.token;
};

type CreateCodeDiffResponse = {
  id: string;
  iv: string;
};
export const createCodeDiff = async (body: {
  beforeSnippet: string;
  afterSnippet: string;
}) => {
  const response = await extendedFetch(`${process.env.BACKEND_URL}/diffs`, {
    method: "POST",
    body: JSON.stringify({
      before: body.beforeSnippet,
      after: body.afterSnippet,
      source: "cli",
    }),
  });
  return (await response.json()) as CreateCodeDiffResponse;
};
