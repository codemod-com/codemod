import type { TreeNode } from "@studio/components/Tree";
import type React from "react";
import { useState } from "react";

export const useScrollNodeIntoView = () => {
  const [selectedElem, setSelectedElem] = useState();
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
      `${node.id}-${node.start}-${node.end}`,
    );
    if (foundElem && treeRef.current) {
      foundElem.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };
  return scrollIntoView;
};

const delay = async (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
