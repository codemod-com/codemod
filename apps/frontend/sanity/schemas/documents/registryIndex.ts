import definePage from "../helpers/definePage";
import page from "./page";

export const registryIndex = definePage({
	name: "registryIndex",
	title: "Registry Index",
	type: "document",
	options: {
		disableCreation: true,
	},
	fields: [
		{
			name: "placeholders",
			title: "Placeholder Text",
			type: "object",
			group: "content",
			options: {
				collapsible: true,
			},
			fields: [
				{
					name: "emptyStateText",
					title: "Empty state text",
					type: "text",
					rows: 3,
				},
				{
					name: "searchPlaceholder",
					title: "Search placeholder",
					type: "string",
					description:
						"Main search input's placeholder text. Defaults to 'Search for codemods'.",
				},
				{
					name: "totalCodemodsSuffix",
					title: "Total codemods suffix",
					type: "string",
					description:
						'Text to display after the total number of codemods. Displays next to the search bar. Defaults to "automations found".',
				},

				{
					name: "verifiedAutomationTooltip",
					title: "Verified Automation Tooltip",
					type: "text",
					description:
						"Tooltip text for the verified automation badge. Keep below 150 characters.",
					rows: 3,
				},
			],
		},
	],
	preview: page.preview,
});
