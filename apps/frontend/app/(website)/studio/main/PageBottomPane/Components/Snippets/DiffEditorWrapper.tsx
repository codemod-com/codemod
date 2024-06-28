import { cn } from "@/utils";
import type { useCodeDiff } from "@studio/hooks/useCodeDiff";
import type { SnippetType } from "@studio/main/PageBottomPane";
import dynamic from "next/dynamic";
import type { PropsWithChildren, ReactNode } from "react";

export type LiveCodemodResultProps = Pick<
  ReturnType<typeof useCodeDiff>,
  "originalEditorProps" | "modifiedEditorProps"
>;

const MonacoDiffEditor = dynamic(
  () => import("@studio/components/Snippet/MonacoDiffEditor"),
  {
    loading: () => <p>Loading...</p>,
    ssr: false,
  },
);
export const DiffEditorWrapper = ({
  originalEditorProps,
  modifiedEditorProps,
  type,
}: Pick<LiveCodemodResultProps, "originalEditorProps" | "modifiedEditorProps"> &
  PropsWithChildren<{
    warnings?: ReactNode;
    type: SnippetType;
  }>) => {
  return (
    <div
      className={cn(
        "relative flex h-full flex-col w-[200%]",
        type === "after" ? "mr-[-50%]" : "ml-[-100%]",
        `${type}-shown`,
      )}
    >
      <div className="relative flex h-full w-full flex-col">
        <MonacoDiffEditor
          renderSideBySide={type === "after"}
          originalModelPath="original.tsx"
          modifiedModelPath="modified.tsx"
          options={{
            readOnly: true,
            originalEditable: true,
          }}
          loading={false}
          originalEditorProps={originalEditorProps}
          modifiedEditorProps={modifiedEditorProps}
        />
      </div>
    </div>
  );
};
