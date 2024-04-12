import type React from "react";
import type { TreeNode } from "../components/Tree";

const useScrollNodeIntoView = () => {
	const scrollIntoView = async (
		node: TreeNode | null,
		treeRef: React.RefObject<HTMLDivElement | null>,
	) => {
		if (!node) {
			return;
		}
		// delay to make the animation smoother
		await delay(200);
		const foundElem = document.getElementById(
			`${node.label}-${node.start}-${node.end}`,
		);

		if (foundElem && treeRef.current) {
			treeRef.current.scrollTo({
				top: foundElem.offsetTop - treeRef.current.offsetTop,
				behavior: "smooth",
			});
		}
	};
	return scrollIntoView;
};

const delay = async (ms: number) =>
	new Promise((resolve) => {
		setTimeout(resolve, ms);
	});

export default useScrollNodeIntoView;
