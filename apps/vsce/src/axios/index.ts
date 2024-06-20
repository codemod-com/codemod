import axios from 'axios';
import axiosRetry from 'axios-retry';

let retryingClient = axios.create();
axiosRetry(retryingClient);

export let DEFAULT_RETRY_COUNT = 3;
export { retryingClient };
