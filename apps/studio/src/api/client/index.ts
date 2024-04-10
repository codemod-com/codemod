import axios, { type AxiosError } from "axios";
import toast from "react-hot-toast";

const apiClient = axios.create({
	baseURL: "http://0.0.0.0:8081", // env.NEXT_PUBLIC_API_URL,
	timeout: 60000,
});

const errorHandler = (error: AxiosError<{ message?: string }>) => {
	if (error.response?.status) {
		toast.error(error.response?.data.message ?? "Network Error", {
			position: "top-center",
		});
	}

	// eslint-disable-next-line prefer-promise-reject-errors
	return Promise.reject({ ...error });
};

apiClient.interceptors.response.use(
	(response) => response,
	(error) => errorHandler(error),
);

export default apiClient;
