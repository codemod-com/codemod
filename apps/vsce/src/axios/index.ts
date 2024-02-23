import axios from "axios";
import axiosRetry from "axios-retry";

const retryingClient = axios.create();
axiosRetry(retryingClient);

export const DEFAULT_RETRY_COUNT = 3;
export { retryingClient };
