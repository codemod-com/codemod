import type { BlocksBody } from "@/types";

export default function getBlocksToc(blocks: BlocksBody | undefined) {
	if (!blocks) return [];

	return blocks
		.map((block) => {
			if (block.style?.length === 2 && block.style?.[0] === "h") {
				return {
					block,
					isSub: block.style?.[1] !== "2",
				} as any;
			}

			return null;
		})
		.filter(Boolean) as { block: BlocksBody; isSub: boolean }[];
}
