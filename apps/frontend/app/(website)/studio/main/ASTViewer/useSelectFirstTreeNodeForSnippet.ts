import { type EditorType, useSnippetsStore } from "@studio/store/snippets";

export const useSelectFirstTreeNodeForSnippet = () => {
  const { getSelectedEditors } = useSnippetsStore();

  return (type: EditorType) => {
    const firstRange = getSelectedEditors()[type]?.ranges?.[0];
    return firstRange && "id" in firstRange ? firstRange : null;
  };
};
