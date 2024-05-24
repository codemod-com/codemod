import { useAiService } from "@chatbot/useAiService/useAiService";
import type { KnownEngines } from "@codemod-com/utilities";
import LiveIcon from "@studio/icons/LiveIcon";
import { CodemodBuilder } from "@studio/main/CodemodBuilder";
import Table from "@studio/main/Log/Table";
import {
  AstSection,
  type PanelData,
  type PanelsRefs,
} from "@studio/main/PageBottomPane";
import { SignInRequired } from "@studio/main/PaneLayout/SignInRequired";
import { useCFSStore } from "@studio/store/zustand/CFS";
import { useModStore } from "@studio/store/zustand/mod";
import { TabNames } from "@studio/store/zustand/view";
import type { ReactNode } from "react";
import { PanelGroup } from "react-resizable-panels";
import { Chat } from "../modGPT";

export type TabsWithContents = { tabs: ReactNode[]; contents: ReactNode[] };
export type TabHeader = { value: string; name: ReactNode };
export type TabContent = TabHeader & { content: ReactNode };

const ChatTab = ({ isSignedIn }: { isSignedIn: boolean }) => {
  const { setContent } = useModStore();
  const {
    AIAssistant: { engine: llmEngine },
  } = useCFSStore();

  const aiAssistantData = useAiService({
    setCodemod: setContent,
    engine: llmEngine,
  });
  return <Chat aiProps={aiAssistantData} isSignedIn={isSignedIn} />;
};
export const getTabsData = ({
  beforePanel,
  afterPanel,
  isSignedIn = false,
  engine,
  panelRefs,
}: {
  isSignedIn?: boolean;
  engine: KnownEngines;
  panelRefs: PanelsRefs;
  beforePanel: PanelData;
  afterPanel: PanelData;
}) => {
  const tabs = [
    {
      value: TabNames.MODGPT,
      name: "ModGPT",
      content: (
        <>
          <ChatTab isSignedIn={isSignedIn} />
          {!isSignedIn && <SignInRequired />}
        </>
      ),
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
