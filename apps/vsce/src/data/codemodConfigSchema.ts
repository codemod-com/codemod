import * as S from "@effect/schema/Schema";

export const PIRANHA_LANGUAGES = [
	"java",
	"kt",
	"go",
	"py",
	"swift",
	"ts",
	"tsx",
	"scala",
] as const;

const piranhaLanguageSchema = S.union(
	...PIRANHA_LANGUAGES.map((language) => S.literal(language)),
);

export type PiranhaLanguage = S.Schema.To<typeof piranhaLanguageSchema>;

export const parsePiranhaLanguage = S.parseSync(piranhaLanguageSchema);
