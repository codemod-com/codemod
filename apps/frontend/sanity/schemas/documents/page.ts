import { definePathname } from "@tinloof/sanity-studio";
import defineFooterAddOn from "../helpers/defineFooterAddOn";
import definePage from "../helpers/definePage";
import defineSections from "../helpers/defineSections";

export default definePage({
	type: "document",
	name: "page",
	groups: [
		{
			title: "Content",
			name: "content",
			default: true,
		},
		{
			title: "SEO & Settings",
			name: "seo",
		},
	],
	fields: [
		{
			type: "string",
			name: "title",
			title: "Title",
			group: "content",
		},
		definePathname(),
		{ type: "section.hero", name: "hero", group: "content" },
		defineSections(),
		{ ...defineFooterAddOn(), group: "content" },
	],
});
