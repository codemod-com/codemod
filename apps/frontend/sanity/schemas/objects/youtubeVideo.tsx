import Icon from "@/components/shared/Icon";
import { defineType } from "sanity";

export const youtubeVideo = defineType({
	type: "object",
	name: "youtubeVideo",
	title: "YouTube Video",
	fields: [
		{
			title: "Youtube URL",
			name: "youtubeUrl",
			type: "string",
			description: "Link to youtube embedded video.",
			validation: (Rule) => Rule.required(),
		},
		{
			type: "string",
			name: "caption",
			title: "Caption",
		},
	],
	preview: {
		select: {
			title: "caption",
		},
		prepare(selection) {
			const { title } = selection;
			return {
				title: title,
				media: <Icon name="youtube" />,
			};
		},
	},
});
