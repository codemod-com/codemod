import { startCronJobs } from "./cron.js";
import { runServer } from "./server.js";

runServer();
startCronJobs();
