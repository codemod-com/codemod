import { type LogoName, TechLogo } from "@/components/shared/Icon";
import { defineType } from "sanity";
import { logo } from "../objects/icon";

export default defineType({
	type: "document",
	name: "techFeature",
	title: "Tech Feature",
	fields: [
		{
			name: "title",
			title: "Title",
			type: "string",
		},
		logo,
		{
			name: "url",
			title: "URL",
			type: "url",
		},
	],
	preview: {
		select: {
			title: "title",
			media: "logo",
		},
		prepare({ title, media }) {
			return {
				title,
				media: () => <TechLogo name={media as LogoName} />,
			};
		},
	},
});
