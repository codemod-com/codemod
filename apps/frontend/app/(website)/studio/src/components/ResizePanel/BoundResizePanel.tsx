import { cn } from "@/utils";
import { isServer } from "@studio/config";
import Layout from "@studio/main/Layout";
import type { PanelComponentProps } from "@studio/main/PageBottomPane";
import { debounce } from "@studio/utils/debounce";
import { isNil } from "@studio/utils/isNil";
import React from "react";

export const BoundResizePanel = ({
  defaultSize = 50,
  minSize = 0,
  panelRefs,
  panelRefIndex,
  children,
  boundedIndex,
  className,
  style = {
    maxHeight: isServer ? 0 : "unset",
    flexBasis: isServer ? "50%" : "0",
  },
}: PanelComponentProps) => {
  return (
    <Layout.ResizablePanel
      className={cn("relative dark:bg-gray-light", className)}
      collapsible
      defaultSize={defaultSize}
      minSize={minSize}
      ref={(ref) => {
        panelRefs.current[panelRefIndex] = ref;
      }}
      style={style}
      onResize={
        !isNil(boundedIndex)
          ? debounce((size) => {
              const panel = panelRefs.current[boundedIndex];
              if (!isNil(panel) && !isNil(size)) panel.resize(size);
            }, 5)
          : undefined
      }
    >
      {children}
    </Layout.ResizablePanel>
  );
};
