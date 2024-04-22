import { definePathname } from "@tinloof/sanity-studio";
import definePage from "../helpers/definePage";
import { logoFields } from "../shared/logoFields";

export default definePage({
	type: "document",
	name: "about",
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
		definePathname(),
		{ type: "section.hero", name: "hero", group: "content" },
		{
			type: "string",
			name: "paragraphTitle",
			title: "Title",
			validation: (Rule) => Rule.required(),
			group: "content",
		},
		{
			type: "richtext",
			name: "paragraphContent",
			title: "Content",
			validation: (Rule) => Rule.required(),
			group: "content",
		},
		{
			type: "string",
			name: "teamTitle",
			title: "Team Section Title",
			validation: (Rule) => Rule.required(),
			group: "content",
		},
		{
			type: "array",
			name: "teamMembers",
			title: "Team Members",
			group: "content",
			of: [
				{
					type: "object",
					fields: [
						{
							type: "image",
							name: "image",
							title: "Image",
						},
						{
							type: "string",
							name: "name",
							title: "Name",
							validation: (Rule) => Rule.required(),
						},
						{
							type: "string",
							name: "role",
							title: "Role",
							validation: (Rule) => Rule.required(),
						},
						{
							type: "url",
							name: "linkedin",
							title: "LinkedIn Profile URL",
						},
						{
							type: "url",
							name: "twitter",
							title: "Twitter Profile URL",
						},
						{
							type: "richtext",
							name: "bio",
							title: "Bio",
							validation: (Rule) => Rule.required(),
						},
						{
							type: "string",
							name: "previousCompany",
							title: "Previous Company",
						},
						{
							name: "previousCompanyLogo",
							title: "Previous Company Logo",
							type: "object",
							description:
								"Please, upload logos with transparent background (svg preferred) and in their horizontal variation. Also try and trim vertical margins as much as possible.",
							fields: logoFields,
						},
					],
				},
			],
		},
		{
			type: "section.hero",
			name: "companies",
			title: "Companies Section",
			group: "content",
		},
		{
			type: "string",
			name: "investorsTitle",
			title: "Investors Section Title",
			validation: (Rule) => Rule.required(),
			group: "content",
		},
		{
			type: "richtext",
			name: "investorsSubtitle",
			title: "Investors Section Subtitle",
			validation: (Rule) => Rule.required(),
			group: "content",
		},
		{
			type: "array",
			name: "investors",
			title: "Investors",
			group: "content",
			of: [
				{
					type: "object",
					fields: [
						{
							type: "image",
							name: "image",
							title: "Image",
						},
						{
							type: "string",
							name: "name",
							title: "Name",
							validation: (Rule) => Rule.required(),
						},
						{
							type: "string",
							name: "role",
							title: "Role",
							validation: (Rule) => Rule.required(),
						},
						{
							name: "companyLogo",
							title: "Company Logo",
							type: "object",
							fields: logoFields,
						},
					],
				},
			],
		},
		{
			type: "reference",
			to: [
				{ type: "pageCta" },
				{ type: "pageCtaDouble" },
				{ type: "pageCtaTriple" },
			],
			name: "cta",
			title: "Page CTA (Optional)",
			description:
				"Call to action for a page. This is placed at the bottom of the page before the footer.",
			group: "content",
		},
	],
	preview: {
		prepare() {
			return {
				title: "About",
			};
		},
	},
});
