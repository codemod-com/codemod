import type { TreeNode } from "@studio/components/Tree";

export const useScrollNodeIntoView = () => {
  const scrollIntoView = async (
    node: TreeNode | null,
    treeRef: React.RefObject<HTMLDivElement | null>,
  ) => {
    if (!node || !treeRef.current) {
      return;
    }

    // delay to make the animation smoother
    await delay(200);

    const foundElem = document.getElementById(node.id);
    if (foundElem) {
      const rect = foundElem.getBoundingClientRect();
      const containerRect = treeRef.current.getBoundingClientRect();

      // const isVisible = (
      //   rect.top >= containerRect.top &&
      //   rect.left >= containerRect.left &&
      //   rect.bottom <= containerRect.bottom &&
      //   rect.right <= containerRect.right
      // );

      if (!false) {
        foundElem.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  };
  return scrollIntoView;
};

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });