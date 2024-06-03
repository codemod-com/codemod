import type {
  CodemodDownloadLinkResponse,
  CodemodListResponse,
  GetScopedTokenResponse,
  ValidateTokenResponse,
} from "@codemod-com/utilities";
import Axios from "axios";
import type FormData from "form-data";

const X_CODEMOD_ACCESS_TOKEN = "X-Codemod-Access-Token".toLocaleLowerCase();

export const getCLIAccessToken = async (
  accessToken: string,
): Promise<GetScopedTokenResponse> => {
  const url = new URL(`${process.env.BACKEND_URL}/clientToken`);

  const res = await Axios.get<GetScopedTokenResponse>(url.toString(), {
    headers: { [X_CODEMOD_ACCESS_TOKEN]: accessToken },
    timeout: 10000,
  });

  return res.data;
};

export const validateAccessToken = async (
  accessToken: string,
): Promise<ValidateTokenResponse> => {
  const res = await Axios.post<ValidateTokenResponse>(
    `${process.env.BACKEND_URL}/validateAccessToken`,
    {},
    {
      headers: {
        [X_CODEMOD_ACCESS_TOKEN]: accessToken,
      },
      timeout: 5000,
    },
  );

  return res.data;
};

export const publish = async (
  accessToken: string,
  formData: FormData,
): Promise<void> => {
  await Axios.post(`${process.env.BACKEND_URL}/publish`, formData, {
    headers: {
      [X_CODEMOD_ACCESS_TOKEN]: accessToken,
      "Content-Type": "multipart/form-data",
    },
    timeout: 10000,
  });
};

export const unpublish = async (
  accessToken: string,
  name: string,
): Promise<void> => {
  await Axios.post(
    `${process.env.BACKEND_URL}/unpublish`,
    { name },
    {
      headers: {
        [X_CODEMOD_ACCESS_TOKEN]: accessToken,
      },
      timeout: 10000,
    },
  );
};

export const revokeCLIToken = async (accessToken: string): Promise<void> => {
  await Axios.delete(`${process.env.BACKEND_URL}/revokeToken`, {
    headers: {
      [X_CODEMOD_ACCESS_TOKEN]: accessToken,
    },
    timeout: 10000,
  });
};

export const getCodemodDownloadURI = async (
  name: string,
  accessToken?: string,
): Promise<CodemodDownloadLinkResponse> => {
  const url = new URL(`${process.env.BACKEND_URL}/codemods/downloadLink`);
  if (name) {
    url.searchParams.set("name", name);
  }

  const headers: { [key: string]: string } = {};
  if (accessToken) {
    headers[X_CODEMOD_ACCESS_TOKEN] = accessToken;
  }

  const res = await Axios.get<CodemodDownloadLinkResponse>(url.toString(), {
    headers,
    timeout: 10000,
  });

  return res.data;
};

export const getCodemodList = async (options?: {
  accessToken?: string;
  search?: string | null;
}): Promise<CodemodListResponse> => {
  const { accessToken, search } = options ?? {};

  const headers: { [key: string]: string } = {};
  if (accessToken) {
    headers[X_CODEMOD_ACCESS_TOKEN] = accessToken;
  }

  const url = new URL(`${process.env.BACKEND_URL}/codemods/list`);
  if (search) {
    url.searchParams.set("search", search);
  }

  const res = await Axios.get<CodemodListResponse>(url.toString(), {
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
    const res = await Axios.post<UserLoginIntentResponse>(
      `${process.env.BACKEND_URL}/intents`,
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
  const res = await Axios.get<ConfirmUserLoggedInResponse>(
    `${process.env.BACKEND_URL}/intents/${sessionId}?iv=${iv}`,
  );

  return res.data.token;
};

type CreateCodeDiffResponse = {
  id: string;
  iv: string;
};
export const createCodeDiff = async (body: {
  beforeSnippet: string;
  afterSnippet: string;
}): Promise<CreateCodeDiffResponse> => {
  const res = await Axios.post<CreateCodeDiffResponse>(
    `${process.env.BACKEND_URL}/diffs`,
    {
      before: body.beforeSnippet,
      after: body.afterSnippet,
      source: "cli",
    },
  );

  return res.data;
};
