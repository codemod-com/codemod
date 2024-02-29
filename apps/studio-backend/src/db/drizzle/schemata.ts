import { sql } from "drizzle-orm";
import {
	index,
	pgTableCreator,
	serial,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `studio_${name}`);

export const posts = createTable(
	"post",
	{
		id: serial("id").primaryKey(),
		name: varchar("name", { length: 256 }),
		createdAt: timestamp("created_at")
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updatedAt"),
	},
	(example) => ({
		nameIndex: index("name_idx").on(example.name),
	}),
);
