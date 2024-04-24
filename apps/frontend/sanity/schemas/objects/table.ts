// import { CgSize } from "react-icons/cg";
// import { IoResize } from "react-icons/io5";
// import { TbRectangle } from "react-icons/tb";
import { ThLargeIcon } from "@sanity/icons";
import { defineType } from "sanity";

export const ptTable = defineType({
	name: "ptTable",
	title: "Table",
	type: "object",
	icon: ThLargeIcon,
	fields: [
		{
			name: "table",
			type: "table",
		},
	],
	preview: {
		prepare() {
			return {
				title: "Table",
			};
		},
	},
});
