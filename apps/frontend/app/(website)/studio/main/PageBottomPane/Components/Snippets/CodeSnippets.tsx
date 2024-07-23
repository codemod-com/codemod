import { cn } from "@/utils";
import ResizeHandle from "@studio/components/ResizePanel/ResizeHandler";
import { CodeSnippedPanel } from "@studio/components/Snippet/CodeSnippedPanel";
import SnippetUI from "@studio/components/Snippet/SnippetUI";
import type { useCodeDiff } from "@studio/hooks/useCodeDiff";
import { DiffEditorWrapper } from "@studio/main/PageBottomPane/Components/Snippets/DiffEditorWrapper";
import { isVisible } from "@studio/utils/visibility";
import React, { type PropsWithChildren } from "react";
import { PanelGroup } from "react-resizable-panels";
import type { PanelData, PanelsRefs } from "../../index";

type CodeSnippetsProps = {
  panels: PanelData[];
  panelRefs: PanelsRefs;
  onlyAfterHidden: boolean;
  codeDiff: ReturnType<typeof useCodeDiff>;
  className?: string;
};
export const CodeSnippets = ({
  className,
  panels,
  children,
  codeDiff,
  panelRefs,
}: PropsWithChildren<CodeSnippetsProps>) => {
  const snippetPanels = panels.map((panelData, index, arr) => {
    const {
      snippetData: {
        snippet,
        getExtras,
        diffEditorWrapper,
        ...codeSnippedPanel
      },
    } = panelData;
    const Snippet = snippet === "regular" ? SnippetUI : DiffEditorWrapper;
    return (
      <React.Fragment key={`fragment-${index}`}>
        <CodeSnippedPanel
          defaultSize={100 / arr.length}
          panelData={panelData}
          className={cn(!isVisible(panelData) && "hidden")}
          panelRefs={panelRefs}
          {...codeSnippedPanel}
        >
          <Snippet
            {...{
              ...diffEditorWrapper,
              ...codeDiff,
            }}
          />
        </CodeSnippedPanel>
        {arr.length !== 1 &&
          index < arr.length - 1 &&
          isVisible(arr[index + 1]) && <ResizeHandle direction="horizontal" />}
      </React.Fragment>
    );
  });
  return (
    <PanelGroup className={className} direction="horizontal">
      {snippetPanels}
      {children}
    </PanelGroup>
  );
};
