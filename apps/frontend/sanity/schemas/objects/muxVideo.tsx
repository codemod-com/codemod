import Icon from "@/components/shared/Icon";

export const muxVideo = {
	type: "object",
	name: "muxVideo",
	title: "Video",
	fields: [
		{
			name: "hasControls",
			title: "Show video controls",
			type: "boolean",
		},
		{
			type: "boolean",
			name: "autoPlay",
			title: "Auto Play",
			description:
				"If checked, the video will start playing as soon as it's loaded.",
		},
		{
			type: "boolean",
			name: "loop",
			title: "Loop",
			description:
				"If checked, the video will start over again when it reaches the end.",
		},

		{
			type: "mux.video",
			name: "video",
			title: "Light Mode Video",
		},
		{
			type: "mux.video",
			name: "darkVideo",
			title: "Dark Mode Video",
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
				media: <Icon name="play" />,
			};
		},
	},
};
