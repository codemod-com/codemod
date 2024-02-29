import { drizzle } from "drizzle-orm/postgres-js";
import { Client } from "pg";

import * as schema from "./schemata";

export const buildDrizzle = async (connectionString: string) => {
	const client = new Client({ connectionString });

	await client.connect();
	return drizzle(client, { schema });
};
