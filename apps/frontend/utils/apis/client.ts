import { env } from "@/env";
import axios, { type AxiosError } from "axios";
import toast from "react-hot-toast";

let apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  timeout: 60000,
});

let errorHandler = (error: AxiosError<{ message?: string }>) => {
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

export default apiClient;
