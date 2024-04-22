import Icon from "@/components/shared/Icon";
import { defineSection } from "@tinloof/sanity-studio";
import { imageWithAltField } from "../shared/imageWithAltField";

export const sectionFullWidthMedia = defineSection({
	title: "Full Width Media",
	name: "section.fullWidthMedia",
	type: "object",
	options: {
		variants: [
			{
				assetUrl: "/static/blocks/full-width-media.png",
			},
		],
	},
	fields: [
		{
			type: "string",
			name: "title",
			title: "Title",
		},
		{
			name: "subtitle",
			title: "Subtitle",
			type: "text",
			rows: 3,
		},
		{
			type: "array",
			name: "mediaTabs",
			title: "Media Tabs",
			of: [
				{
					type: "object",
					title: "Tab",
					fields: [
						{
							type: "string",
							name: "tabTitle",
							title: "Tab Title",
							description: "The title of the tab used to switch items",
						},
						{
							type: "array",
							name: "mediaItem",
							title: "Media Item",
							description: "The media item to display in the tab. Max 1 item.",
							validation: (Rule) => Rule.required().max(1),
							of: [
								{
									type: "muxVideo",
									title: "Mux Video",
								},
								{
									...imageWithAltField,
									type: "image",
								},
							],
						},
					],
					preview: {
						select: {
							title: "tabTitle",
							isVideo: "isVideo",
							image: "image",
						},
						prepare(selection) {
							const { title, isVideo, image } = selection;
							return {
								title: title,
								media: isVideo ? <Icon name="play" /> : image,
							};
						},
					},
				},
			],
		},
	],
	preview: {
		select: {
			title: "title",
			subtitle: "subtitle",
			media: "media",
		},
		prepare(selection) {
			const { title, subtitle, media } = selection;
			return {
				title: title,
				subtitle: subtitle,
				media: <Icon name="layers-2" />,
			};
		},
	},
});
