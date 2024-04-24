import { defineType } from "sanity";
import { automationApplicability } from "../shared/automationApplicability";

export const automationVersion = defineType({
	name: "automationVersion",
	title: "Codemod Version",
	type: "object",
	fields: [
		{
			name: "codemodStudioExampleLink",
			title: "Codemod Studio Example Link",
			type: "string",
		},
		{
			name: "testProjectCommand",
			title: "Test Project Command",
			type: "string",
		},
		{
			name: "id",
			title: "Version ID",
			type: "number",
			readOnly: true,
		},
		{
			name: "version",
			title: "Version",
			type: "string",
			readOnly: true,
		},
		{
			name: "shortDescription",
			title: "Short Description",
			type: "string",
			readOnly: true,
		},
		{
			name: "engine",
			title: "Engine",
			type: "string",
			readOnly: true,
		},
		automationApplicability,
		{
			name: "arguments",
			title: "Arguments",
			type: "string",
			readOnly: true,
		},

		{
			name: "vsCodeLink",
			title: "VS Code Link",
			type: "string",
			readOnly: true,
		},

		{
			name: "sourceRepo",
			title: "Source Repository",
			type: "string",
			readOnly: true,
		},
		{
			name: "amountOfUses",
			title: "Amount of Uses",
			type: "number",
			readOnly: true,
		},
		{
			name: "totalTimeSaved",
			title: "Total Time Saved",
			type: "number",
			readOnly: true,
		},
		{
			name: "openedPrs",
			title: "Opened PRs",
			type: "number",
			readOnly: true,
		},
		{
			name: "bucketLink",
			title: "Bucket Link",
			type: "string",
			readOnly: true,
		},
		{
			name: "useCaseCategory",
			title: "Use-Case Category",
			type: "string",
			readOnly: true,
		},
		{
			name: "tags",
			title: "Tags",
			type: "array",
			of: [{ type: "string" }],
		},
		{
			name: "codemodId",
			title: "Codemod ID",
			type: "number",
			readOnly: true,
		},
		{
			name: "createdAt",
			title: "Created At",
			type: "string",
			readOnly: true,
		},
		{
			name: "updatedAt",
			title: "Updated At",
			type: "string",
			readOnly: true,
		},
	],
});
