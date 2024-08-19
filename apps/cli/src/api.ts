import { Octokit } from "@octokit/rest";
import axios, { AxiosError, type RawAxiosRequestHeaders } from "axios";

import type {
  CodemodDownloadLinkResponse,
  CodemodListResponse,
  GetCodemodResponse,
  GetScopedTokenResponse,
  GetUserDataResponse,
  VerifyTokenResponse,
} from "@codemod-com/api-types";
import type { LLMEngine } from "@codemod-com/utilities";
import { streamingFetch } from "#utils/download.js";

export const extractPrintableApiError = (err: unknown): string => {
  if (!(err instanceof Error)) {
    return "An unknown error occurred.";
  }

  return err instanceof AxiosError ? err.response?.data.errorText : err.message;
};

export const getCLIAccessToken = async (
  accessToken: string,
): Promise<GetScopedTokenResponse> => {
  const url = new URL(`${process.env.AUTH_BACKEND_URL}/appToken`);

  const res = await axios.get<GetScopedTokenResponse>(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
    timeout: 10000,
  });

  return res.data;
};

export const validateCLIToken = async (
  accessToken: string,
): Promise<VerifyTokenResponse> => {
  const res = await axios.get<VerifyTokenResponse>(
    `${process.env.AUTH_BACKEND_URL}/verifyToken`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 5000,
    },
  );

  return res.data;
};

export const getUserData = async (
  accessToken: string,
): Promise<GetUserDataResponse | null> => {
  try {
    const { data } = await axios.get<GetUserDataResponse | object>(
      `${process.env.AUTH_BACKEND_URL}/userData`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 5000,
      },
    );

    if (!("user" in data)) {
      return null;
    }

    return data;
  } catch (err) {
    return null;
  }
};

export const publish = async (
  accessToken: string,
  formData: FormData,
): Promise<void> => {
  await axios.post(`${process.env.BACKEND_URL}/publish`, formData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "multipart/form-data",
    },
    timeout: 10000,
  });
};

export const unpublish = async (
  accessToken: string,
  name: string,
): Promise<void> => {
  await axios.post(
    `${process.env.BACKEND_URL}/unpublish`,
    { name },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 10000,
    },
  );
};

export const revokeCLIToken = async (accessToken: string): Promise<void> => {
  return axios.delete(`${process.env.AUTH_BACKEND_URL}/revokeToken`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    timeout: 10000,
  });
};

export const getCodemod = async (
  name: string,
  accessToken?: string,
): Promise<GetCodemodResponse> => {
  const url = new URL(`${process.env.BACKEND_URL}/codemods/${name}`);

  const headers: RawAxiosRequestHeaders = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const res = await axios.get<GetCodemodResponse>(url.toString(), {
    headers,
    timeout: 10000,
  });

  return res.data;
};

export const getGithubAPIKey = async (
  accessToken: string,
): Promise<string | undefined> => {
  const res = await axios.get<{ token?: string }>(
    `${process.env.AUTH_BACKEND_URL}/oAuthToken`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 10000,
    },
  );

  return res.data.token;
};

export const getGithubAvailableScope = async (
  accessToken: string,
): Promise<string[]> => {
  const octokit = new Octokit({
    auth: accessToken,
    log: {
      debug() {},
      error() {},
      info() {},
      warn() {},
    },
  });

  const response = await octokit.request("GET /");
  if (response.status < 200 || response.status >= 300) {
    return [];
  }

  return response.headers?.["x-oauth-scopes"]?.split(", ") ?? [];
};

export const getCodemodDownloadURI = async (
  name: string,
  accessToken?: string,
): Promise<CodemodDownloadLinkResponse> => {
  const url = new URL(`${process.env.BACKEND_URL}/codemods/downloadLink`);
  if (name) {
    url.searchParams.set("name", name);
  }

  const headers: RawAxiosRequestHeaders = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const res = await axios.get<CodemodDownloadLinkResponse>(url.toString(), {
    headers,
    timeout: 10000,
  });

  return res.data;
};

export const getCodemodList = async (options?: {
  token?: string;
  search: string | null;
  mine: boolean;
  all: boolean;
}): Promise<CodemodListResponse> => {
  const { token, search, mine, all } = options ?? {};

  const headers: RawAxiosRequestHeaders = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url = new URL(`${process.env.BACKEND_URL}/codemods/list`);
  if (search) {
    url.searchParams.set("search", search);
  }

  if (mine) {
    url.searchParams.set("mine", "true");
  }

  if (all) {
    url.searchParams.set("all", "true");
  }

  const res = await axios.get<CodemodListResponse>(url.toString(), {
    headers,
    timeout: 10000,
  });

  return res.data;
};

type UserLoginIntentResponse = {
  id: string;
  iv: string;
};
export const generateUserLoginIntent =
  async (): Promise<UserLoginIntentResponse> => {
    const res = await axios.post<UserLoginIntentResponse>(
      `${process.env.AUTH_BACKEND_URL}/intents`,
      {},
    );

    return res.data;
  };

type ConfirmUserLoggedInResponse = {
  token: string;
};
export const confirmUserLoggedIn = async (
  sessionId: string,
  iv: string,
): Promise<string> => {
  const res = await axios.get<ConfirmUserLoggedInResponse>(
    `${process.env.AUTH_BACKEND_URL}/intents/${sessionId}?iv=${iv}`,
  );

  return res.data.token;
};

type CreateCodeDiffResponse = {
  id: string;
  iv: string;
};
export const createCodeDiff = async (
  diffs: { before: string; after: string }[],
): Promise<CreateCodeDiffResponse> => {
  const res = await axios.post<CreateCodeDiffResponse>(
    `${process.env.BACKEND_URL}/diffs`,
    { diffs, source: "cli" },
  );

  return res.data;
};

// @TODO: use types from feat/insights-fe branch (insights feature backend)
export const sendCodemodAIRequest = (options: {
  accessToken: string;
  prompt: string;
  engine?: LLMEngine;
  signal?: AbortSignal;
}) => {
  const { accessToken, signal, prompt, engine = "gpt-4o" } = options;

  return streamingFetch(() =>
    fetch(process.env.CODEMODAI_URL, {
      method: "POST",
      body: JSON.stringify({ messages: [prompt], engine }),
      headers: { Authorization: `Bearer ${accessToken}` },
      signal,
    }),
  );
};

// @TODO: use types from feat/insights-fe branch (insights feature backend)
export const sendModGPTRequest = (options: {
  accessToken: string;
  prompt: string;
  engine?: LLMEngine;
  signal?: AbortSignal;
}) => {
  const { accessToken, signal, prompt, engine = "gpt-4o" } = options;

  return streamingFetch(() =>
    fetch(`${process.env.MODGPT_URL}/sendChat`, {
      method: "GET",
      body: JSON.stringify({ messages: [prompt], engine }),
      headers: { Authorization: `Bearer ${accessToken}` },
      signal,
    }),
  );
};
