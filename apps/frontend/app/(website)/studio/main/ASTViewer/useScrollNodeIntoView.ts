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
    const foundElem = document.getElementById(`${node.id}`);

    console.log(
      node.id,
      {
        foundElem,
      },
      treeRef,
      treeRef.current,
    );

    if (foundElem && treeRef.current) {
      const treeRootWithOverflow = treeRef.current.firstChild.firstChild;
      // const top = foundElem.getBoundingClientRect().top - treeRootWithOverflow.offsetTop
      // console.log('foundElem.offsetHeight', foundElem.getBoundingClientRect().top , {
      //   top
      // })
      // treeRootWithOverflow.scrollTo({
      //   top,
      //   behavior: "smooth",
      // });
      setTimeout(
        () => foundElem.scrollIntoView({ behavior: "smooth", block: "center" }),
        500,
      );
    }
  };
  return scrollIntoView;
};

const delay = async (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
