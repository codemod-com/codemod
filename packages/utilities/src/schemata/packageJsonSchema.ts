import { object, optional, string } from "valibot";

export const packageJsonSchema = object({
	main: string(),
	name: string(),
	license: optional(string()),
});
