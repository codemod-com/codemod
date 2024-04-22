import { TagIcon } from "@sanity/icons";
import { defineType } from "sanity";

export const globalLabels = defineType({
	type: "document",
	name: "globalLabels",
	title: "Global Labels",
	icon: TagIcon,
	groups: [
		{
			title: "Blog",
			name: "blog",
		},
		{
			title: "Careers",
			name: "careers",
		},
		{
			title: "Codemod Page",
			name: "codemodPage",
		},
	],

	fields: [
		{
			name: "internalTitle",
			title: "Internal title",
			type: "string",
			description:
				"This title is only used internally in Sanity, it won't be displayed on the website.",
			hidden: true,
		},
		{
			name: "blog",
			title: "Blog Labels",
			type: "object",
			group: "blog",
			fields: [
				{
					type: "string",
					name: "relatedArticles",
					title: "Related Articles Label",
					description:
						"Label for the related articles section shown on blog posts. Default: 'Related Articles'",
				},
				{
					name: "backToIndex",
					title: "Back to index",
					type: "string",
					description:
						'Label for the back to index link shown on blog posts. Default: "Back to blog"',
				},
			],
		},
		{
			name: "careers",
			title: "Careers Labels",
			type: "object",
			group: "careers",
			fields: [
				{
					type: "string",
					name: "relatedJobs",
					title: "Related positions label",

					description:
						"Label for the related positons section shown on job posts. Default: 'Related Positions'",
				},
				{
					name: "backToIndex",
					title: "Back to index",
					type: "string",
					description:
						'Label for the back to index link shown on job posts. Default: "Back to careers"',
				},
				{
					name: "applyToPosition",
					title: "Apply to position",
					type: "string",
					description:
						'Label for the apply to position link shown on job posts. Default: "Apply to position"',
				},
				{
					name: "applyToPositionDescription",
					title: "Apply to position description",
					type: "string",
					description:
						'Label for the apply to position link shown on job posts. Default: "Ready to feel the rush?"',
				},
				{
					name: "applyToPositionCTA",
					title: "Apply to position CTA text",
					type: "string",
					description:
						'Label for the apply to position CTA shown on job posts. Default: "Apply"',
				},
			],
		},
		{
			name: "codemodPage",
			title: "Codemod page",
			group: "codemodPage",
			type: "object",
			fields: [
				{
					name: "backToIndex",
					title: "Back to index",
					type: "string",
					description: 'Label for the back to index link. Default: "Back"',
				},

				{
					name: "documentationPopup",
					title: "Documentation Popup",
					type: "richtext",
					description:
						"Content for the documentation popup - shown upon hovering the info icon in the sidebar",
				},
				{
					name: "documentationPopupLink",
					title: "Documentation Popup Link",
					type: "cta",
				},
				{
					name: "runSectionTitle",
					title: "Run Section Title",
					type: "string",
					description: 'Title for the run section. Defaults to "Run"',
				},
				{
					name: "runCommandTitle",
					title: "Run command title",
					type: "string",
					description: 'Title for the CLI command. Defaults to "CLI"',
				},
				{
					name: "runCommandPrefix",
					title: "Run command prefix",
					type: "string",
					description:
						'Prefix for the run command button. Defaults to "codemod"',
				},

				{
					name: "vsCodeExtensionTitle",
					title: "Vs code extension title",
					type: "string",
					description:
						'Title for the vs code extension section. Defaults to "VS Code Extension"',
				},
				{
					name: "vsCodeExtensionButtonLabel",
					title: "Vs code extension button label",
					type: "string",
					description:
						'Label for the vs code extension button. Defaults to "Run in VS Code"',
				},
				{
					name: "codemodStudioExampleTitle",
					title: "Codemod studio example title",
					type: "string",
					description:
						'Title for the codemod studio example section. Defaults to "Codemod Studio Example"',
				},
				{
					name: "codemodStudioExampleButtonLabel",
					title: "Codemod studio example button label",
					type: "string",
					description:
						'Label for the codemod studio example button. Defaults to "Run in Codemod Studio"',
				},

				{
					name: "textProjectTitle",
					title: "Text project title",
					type: "string",
					description:
						'Title for the text project section. Defaults to "Install Text Project"',
				},
				{
					name: "sourceRepoTitle",
					title: "Source repo title",
					type: "string",
					description:
						'Title for the source repo section. Defaults to "Repository"',
				},
				{
					name: "ctaTitle",
					title: "CTA Title",
					type: "string",
				},
				{
					name: "ctaDescription",
					title: "CTA Description",
					type: "text",
					rows: 3,
				},
				{
					name: "cta",
					title: "CTA",
					type: "cta",
				},
			],
		},
	],
});
