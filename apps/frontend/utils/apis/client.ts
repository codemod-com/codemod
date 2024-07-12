import { env } from "@/env";
import type { ApiError } from "@codemod-com/utilities";
import axios, { type AxiosError } from "axios";
import toast from "react-hot-toast";

const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  timeout: 60000,
});

const authApiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_AUTH_API_URL,
  timeout: 60000,
});

const aiApiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_AI_API_URL,
  timeout: 60000,
});

const errorHandler = (error: AxiosError<ApiError>) => {
  if (error.response?.status) {
    toast.error(
      error.response?.data.errorText ??
        (error.response?.data as any).message ??
        "Network Error",
      {
        position: "top-center",
      },
    );
  }

  return Promise.reject({ ...error });
};

apiClient.interceptors.response.use(
  (response) => response,
  (error) => errorHandler(error),
);

authApiClient.interceptors.response.use(
  (response) => response,
  (error) => errorHandler(error),
);

aiApiClient.interceptors.response.use(
  (response) => response,
  (error) => errorHandler(error),
);

export { apiClient, authApiClient, aiApiClient };
