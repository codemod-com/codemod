import "dotenv/config";

import { type Config } from "drizzle-kit";

export default {
	schema: "./src/db/drizzle/schemata.ts",
	driver: "pg",
	dbCredentials: {
		connectionString: process.env.DATABASE_URI as string,
	},
	tablesFilter: ["studio_*"],
} satisfies Config;
