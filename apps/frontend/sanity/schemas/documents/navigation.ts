import { MenuIcon } from "@sanity/icons";
import { defineType } from "sanity";
export default defineType({
	type: "document",
	name: "navigation",
	title: "Navigation",
	icon: MenuIcon,
	groups: [
		{
			title: "Main navigation",
			name: "main-navigation",
			default: true,
		},
		{
			title: "Announcement Bar",
			name: "announcement-bar",
		},
	],
	fields: [
		{
			type: "string",
			name: "title",
			title: "Internal Title",
			hidden: true,
		},
		{
			name: "navigationItems",
			title: "Navigation items",
			description:
				"Add the items you want to appear in the main navigation (Max 6 items)",
			type: "array",
			of: [{ type: "link" }],
			validation: (Rule) => Rule.max(6),
			group: "main-navigation",
		},
		{
			name: "navigationCtas",
			title: "Navigation CTA items",
			type: "array",
			group: "main-navigation",
			of: [{ type: "link" }],
			description:
				"Desktop: Top right corner, Mobile: Bottom of the menu. 1st link will be the primary CTA. Max 2 items.",
			validation: (Rule) => Rule.max(2),
		},
		{
			name: "announcementBar",
			title: "Announcement Bar",
			type: "object",
			fields: [
				{
					name: "enabled",
					title: "Enable",
					type: "boolean",
				},
				{
					name: "dismissable",
					title: "Dismissable",
					type: "boolean",
				},
				{
					name: "message",
					title: "Message",
					type: "richtext",
					validation: (Rule) => Rule.valueOfField("enabled") && Rule.required(),
				},
			],
			group: "announcement-bar",
		},
	],
});
