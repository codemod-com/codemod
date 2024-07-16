import { ASTViewer } from "@features/ASTViewer/AboristViewer";
import { BoundResizePanel } from "@studio/components/ResizePanel/BoundResizePanel";
import ResizeHandle from "@studio/components/ResizePanel/ResizeHandler";
import type {
  PanelData,
  PanelsRefs,
} from "@studio/main/PageBottomPane/utils/types";
import { isVisible } from "@studio/utils/visibility";
import React, { memo } from "react";

const AstSectionBase = ({
  panels,
  panelRefs,
}: {
  panels: PanelData[];
  panelRefs: PanelsRefs;
}) => {
  return panels.filter(isVisible).map((panel, i, { length }) => (
    <React.Fragment key={panel.relatedAST}>
      <BoundResizePanel
        className="h-full"
        panelRefs={panelRefs}
        key={panel.relatedAST}
        defaultSize={100 / panels.length}
        panelRefIndex={panel.relatedAST}
        boundedIndex={
          panel.boundIndex === panel.relatedAST ? panel.snippedIndex : undefined
        }
        {...panel}
      >
        <ASTViewer type={panel.type} />
      </BoundResizePanel>
      {i !== length - 1 && isVisible(panels[i + 1]) && (
        <ResizeHandle key={`resize-handle-${i}`} direction="horizontal" />
      )}
    </React.Fragment>
  ));
};

export const AstSection = memo(AstSectionBase);
