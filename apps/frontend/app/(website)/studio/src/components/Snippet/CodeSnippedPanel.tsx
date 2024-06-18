import { cn } from "@/utils";
import {
  BoundResizePanel,
  type PanelData,
  type PanelsRefs,
  SnippetHeader,
} from "@studio/main/PageBottomPane";
import type { PropsWithChildren, ReactNode } from "react";

export const CodeSnippedPanel = ({
  children,
  header,
  className,
  panelData,
  defaultSize,
  panelRefs,
  warnings,
}: PropsWithChildren<{
  className?: string;
  header: string;
  defaultSize: number;
  panelRefs: PanelsRefs;
  panelData: PanelData;
  warnings?: ReactNode;
}>) => {
  return (
    <BoundResizePanel
      className={cn(
        "visibilityOptions" in panelData && "collapsable_panel",
        className,
      )}
      boundedIndex={panelData.boundIndex}
      defaultSize={defaultSize}
      panelRefIndex={panelData.snippedIndex}
      panelRefs={panelRefs}
    >
      <SnippetHeader
        visibilityOptions={panelData.visibilityOptions}
        title={header}
      />
      {warnings}
      {children}
    </BoundResizePanel>
  );
};
