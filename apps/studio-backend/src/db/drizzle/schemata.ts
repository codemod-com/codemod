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
	(post) => ({
		nameIndex: index("name_idx").on(post.name),
	}),
);

export const typeEnum = pgEnum("type", ["recipe", "codemod"]);

export const codemods = createTable(
	"codemod",
	{
		id: serial("id").primaryKey(),
		slug: varchar("slug", { length: 255 }).notNull(),
		codemod_name: varchar("codemod_name", { length: 255 }).notNull(),
		short_description: text("short_description"),
		type: typeEnum("type").notNull(),
		featured: boolean("featured").notNull(),
		verified: boolean("verified").notNull(),
		framework: varchar("framework", { length: 255 }).notNull(),
		framework_version: varchar("framework_version", { length: 255 }).notNull(),
		author: varchar("author", { length: 255 }).notNull(),
		engine: varchar("engine", { length: 255 }).notNull(),
		requirements: varchar("requirements", { length: 255 }).notNull(),
		version: varchar("version", { length: 255 }).notNull(),
		last_update: timestamp("last_update")
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		command: varchar("command", { length: 255 }).notNull(),
		vs_code_link: varchar("vs_code_link", { length: 255 }).notNull(),
		codemod_studio_example_link: varchar("codemod_studio_example_link", {
			length: 255,
		}).notNull(),
		test_project_command: varchar("test_project_command", {
			length: 255,
		}).notNull(),
		source_repo: varchar("source_repo", { length: 255 }).notNull(),
		amount_of_uses: integer("amount_of_uses").notNull(),
		total_time_saved: varchar("total_time_saved", { length: 255 }).notNull(),
		opened_prs: varchar("opened_prs", { length: 255 }),
		labels: varchar("labels", { length: 255 }).array().default([]).notNull(),
		user_stories: varchar("user_stories", { length: 255 }),
		readme_link: varchar("readme_link", { length: 255 }).notNull(),
		index_ts_link: varchar("index_ts_link", { length: 255 }).notNull(),
		private: boolean("private").notNull(),
		conditional_visibility_toggles: varchar("conditional_visibility_toggles", {
			length: 255,
		}).notNull(),
	},
	(codemod) => ({
		slugIndex: index("slug_idx").on(codemod.slug),
	}),
);
