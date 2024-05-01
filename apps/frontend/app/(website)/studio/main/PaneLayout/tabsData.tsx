import type { KnownEngines } from "@codemod-com/utilities";
import Chat from "@studio/components/chatbot/Chat";
import { useModGPT } from "@studio/components/chatbot/useModGpt";
import { CodemodBuilder } from "@studio/main/CodemodBuilder";
import LiveIcon from "@studio/main/LiveIcon";
import Table from "@studio/main/Log/Table";
import {
  AstSection,
  type PanelData,
  type PanelsRefs,
} from "@studio/main/PageBottomPane";
import { SignInRequired } from "@studio/main/PaneLayout/SignInRequired";
import { TabNames } from "@studio/store/zustand/view";
import type { ReactNode } from "react";
import { PanelGroup } from "react-resizable-panels";

export type TabsWithContents = { tabs: ReactNode[]; contents: ReactNode[] };
export type TabHeader = { value: string; name: ReactNode };
export type TabContent = TabHeader & { content: ReactNode };

export const useTabs = ({
  beforePanel,
  afterPanel,
  isSignedIn = false,
  showBuildPanel,
  engine,
  panelRefs,
}: {
  showBuildPanel: boolean;
  isSignedIn?: boolean;
  engine: KnownEngines;
  panelRefs: PanelsRefs;
  beforePanel: PanelData;
  afterPanel: PanelData;
}) => {
  const modGPT = useModGPT();

  const tabs = [
    {
      value: TabNames.MODGPT,
      name: "ModGPT",
      content: (
        <>
          <Chat modGPT={modGPT} isSignedIn={isSignedIn} />
          {!isSignedIn && <SignInRequired />}
        </>
      ),
    },
    showBuildPanel && {
      value: TabNames.INFERRER,
      name: "Builder",
      content: <CodemodBuilder />,
    },
    {
      value: TabNames.AST,
      name: "AST",
      content: (
        <PanelGroup direction="horizontal">
          <AstSection
            panels={[beforePanel, afterPanel]}
            engine={engine}
            panelRefs={panelRefs}
          />
        </PanelGroup>
      ),
    },
    {
      value: TabNames.DEBUG,
      name: (
        <>
          <LiveIcon /> Debug
        </>
      ),
      content: <Table />,
    },
  ];

  return tabs;
};
