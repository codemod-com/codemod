import { CogIcon } from "@sanity/icons";
import { TextInput } from "@sanity/ui";

import React from "react";

export const settings = {
	name: "settings",
	title: "Settings",
	type: "document",
	icon: CogIcon,
	groups: [
		{
			title: "Integrations",
			name: "integrations",
			icon: CogIcon as any,
		},
	],
	options: {
		disableCreation: true,
	},
	fields: [
		{
			title: "Title",
			name: "title",
			type: "string",
			hidden: true,
		},
		{
			name: "fallbackOgImage",
			title: "Fallback sharing image",
			description:
				"Will be used as the sharing image of all pages that don't define a custom one in their SEO fields.",
			type: "ogImage",
			validation: (Rule) => Rule.required(),
		},
		{
			name: "redirects",
			title: "Redirects",
			type: "array",
			options: {
				layout: "list",
			},
			components: {
				input: ArrayInput,
			},
			of: [
				{
					name: "redirect",
					title: "Redirect",
					type: "object",
					fields: [
						{
							name: "source",
							type: "string",
							validation: (Rule) => Rule.required(),
						},
						{
							name: "destination",
							type: "string",
							validation: (Rule) => Rule.required(),
						},
						{
							name: "permanent",
							description:
								"Turn this off if the redirect is temporary and you intend on reverting it in the near future.",
							type: "boolean",
							initialValue: true,
						},
					],
					preview: {
						select: {
							source: "source",
							destination: "destination",
							permanent: "permanent",
							parent: "^",
						},
						prepare(data) {
							return {
								title: `From: "${data.source}"`,
								subtitle: `To: "${data.destination}"`,
								media: () => (data.permanent ? "308" : "307"),
							};
						},
					},
				},
			],
		},
	],
	preview: {
		prepare: () => ({
			title: "Settings",
		}),
	},
};

function ArrayInput({ members, ...props }: any) {
	const [search, setSearch] = React.useState("");

	const filteredMembers = !search
		? members
		: members?.filter(
				(member: any) =>
					!member?.item?.value?.source ||
					!member?.item?.value?.destination ||
					member?.item?.value?.source?.includes(search) ||
					member?.item?.value?.destination?.includes(search),
			);
	return (
		<div style={{ display: "grid", gap: 8 }}>
			<TextInput
				type="text"
				placeholder="Filter by source or destination"
				value={search}
				onChange={(e) => setSearch(e.currentTarget.value)}
			/>
			{props.renderDefault({ ...props, members: filteredMembers })}
		</div>
	);
}
