import { env } from "@/env";
import axios, { type AxiosError } from "axios";
import toast from "react-hot-toast";

const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  timeout: 60000,
});

// mostly for local dev, in prod they should be on the same domain.
// later we need to figure out how to do this in a better way
const authApiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_AUTH_API_URL,
  timeout: 60000,
});

const errorHandler = (error: AxiosError<{ message?: string }>) => {
  if (error.response?.status) {
    toast.error(error.response?.data.message ?? "Network Error", {
      position: "top-center",
    });
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

export { apiClient, authApiClient };
