import { sql } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	pgEnum,
	pgTableCreator,
	serial,
	text,
	timestamp,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `studio_${name}`);

export const typeEnum = pgEnum("type", ["recipe", "codemod"]);

export const codemods = createTable(
	"codemod",
	{
		id: serial("id").primaryKey(),
		slug: varchar("slug", { length: 255 }).notNull(),
		name: varchar("name", { length: 255 }).notNull(),
		shortDescription: text("short_description"),
		type: typeEnum("type").notNull(),
		featured: boolean("featured").notNull(),
		verified: boolean("verified").notNull(),
		framework: varchar("framework", { length: 255 }).notNull(),
		frameworkVersion: varchar("framework_version", { length: 255 }).notNull(),
		author: varchar("author", { length: 255 }).notNull(),
		engine: varchar("engine", { length: 255 }).notNull(),
		requirements: varchar("requirements", { length: 255 }),
		version: varchar("version", { length: 255 }).notNull(),
		lastUpdate: timestamp("last_update")
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		command: varchar("command", { length: 255 }).notNull(),
		vsCodeLink: varchar("vs_code_link", { length: 255 }).notNull(),
		codemodStudioExampleLink: varchar("codemod_studio_example_link", {
			length: 255,
		}).notNull(),
		testProjectCommand: varchar("test_project_command", {
			length: 255,
		}).notNull(),
		sourceRepo: varchar("source_repo", { length: 255 }).notNull(),
		amountOfUses: integer("amount_of_uses").notNull().default(0),
		totalTimeSaved: integer("total_time_saved").notNull().default(0),
		openedPrs: integer("opened_prs").notNull().default(0),
		labels: varchar("labels", { length: 255 })
			.array()
			.default(sql`ARRAY[]::varchar[]`),
		userStories: varchar("user_stories", { length: 255 }),
		readmeLink: varchar("readme_link", { length: 255 }).notNull(),
		indexTsLink: varchar("index_ts_link", { length: 255 }).notNull(),
		private: boolean("private").notNull(),
	},
	(codemod) => ({
		slugIndex: uniqueIndex("slug_idx").on(codemod.slug),
	}),
);
