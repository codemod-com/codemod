import { NumberIcon } from "@sanity/icons";
import { defineType } from "sanity";

export const stats = defineType({
	name: "stats",
	title: "Stats",
	icon: NumberIcon,
	type: "object",
	fields: [
		{
			name: "from",
			title: "Title",
			type: "string",
			validation: (Rule) => Rule.required(),
		},
		{
			type: "string",
			name: "to",
			title: "To",
			hidden: ({ parent }) => !parent.useFromTo,
			validation: (Rule) =>
				Rule.custom((to, context) => {
					if ((context.parent as any).useFromTo && !to) {
						return "To is required when using From → To format";
					}
					return true;
				}),
		},
		{
			name: "useFromTo",
			title: "Use From → To format",
			type: "boolean",
		},

		{
			name: "subtitle",
			title: "Subtitle",
			type: "text",
			rows: 3,
		},
	],
	preview: {
		select: {
			from: "from",
			to: "to",
		},
		prepare({ from, to }) {
			return {
				title: from + (to ? ` → ${to}` : ""),
			};
		},
	},
});
