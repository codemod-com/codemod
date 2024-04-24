import { UserIcon } from "@sanity/icons";
import { defineType } from "sanity";
import { imageWithAltField } from "../shared/imageWithAltField";

export const blogAuthor = defineType({
	name: "blog.author",
	title: "Blog Author",
	type: "document",
	icon: UserIcon,
	fields: [
		{
			type: "string",
			name: "name",
			title: "Name",
			validation: (Rule) => Rule.required(),
		},
		{
			type: "string",
			name: "details",
			title: "Additional info about the author",
		},
		{
			name: "socialUrl",
			title: "Social URL",
			type: "url",
		},

		{
			...imageWithAltField,
			name: "image",
		},
	],
});
