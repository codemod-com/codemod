import { defineType } from "sanity";

export default defineType({
	type: "document",
	name: "pageCtaTriple",
	title: "Page CTA with 3 columns",
	description:
		"Call to action with three buttons for a page. This is placed at the bottom of the page before the footer",
	fields: [
		{
			type: "string",
			name: "title",
			title: "Title",
			validation: (Rule) => Rule.required(),
		},
		{
			name: "splitPattern",
			title: "Split pattern",
			description:
				'Creates a line break in the title. Input the characters that should preceed the line break. E.g. "."',
			type: "string",
		},
		{
			type: "richtext",
			name: "paragraph",
			title: "Paragraph",
			validation: (Rule) => Rule.required(),
		},
		{
			type: "array",
			name: "ctas",
			title: "Call to actions",
			of: [{ type: "styledCta" }],
			validation: (Rule) => Rule.required().min(3).max(3),
		},
	],
});
