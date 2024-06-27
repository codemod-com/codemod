import "dotenv/config";

import { startCronJobs } from "./cron";
import { runServer } from "./server";

runServer();
startCronJobs();
