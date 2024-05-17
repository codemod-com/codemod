import { cn } from "@/utils";
import { useAiService } from "@chatbot/useAiService/useAiService";
import { useAuth } from "@clerk/nextjs";
import Text from "@studio/components/Text";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@studio/components/ui/tabs";
import type { PanelData, PanelsRefs } from "@studio/main/PageBottomPane";
import {
  type TabContent,
  type TabHeader,
  type TabsWithContents,
  useTabs,
} from "@studio/main/PaneLayout/tabsData";
import { useSnippetStore } from "@studio/store/zustand/snippets";
import { TabNames, useViewStore } from "@studio/store/zustand/view";
import { useCallback, useEffect, useRef, useState } from "react";

let reduceTabs = (acc: TabsWithContents, { value, name }: TabHeader) => [
  ...acc.tabs,
  <TabsTrigger key={value} className="flex-1" value={value}>
    {name}
  </TabsTrigger>,
];

export let AssistantTab = ({
  panelRefs,
  beforePanel,
  afterPanel,
}: {
  panelRefs: PanelsRefs;
  beforePanel: PanelData;
  afterPanel: PanelData;
}) => {
  let { activeTab } = useViewStore();
  let { engine } = useSnippetStore();

  let scrollContainerRef = useRef<HTMLDivElement>(null);
  let savedScrollPositionRef = useRef<number>(0);
  let { isSignedIn } = useAuth();
  let [showBuildPanel, setShowBuildPanel] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("feature-builder") === "true") {
      setShowBuildPanel(true);
    }
  }, []);

  let { setActiveTab } = useViewStore();

  let handleOnClick = useCallback(
    (newActiveTab: TabNames) => {
      setActiveTab(newActiveTab);
    },
    [setActiveTab],
  );

  useEffect(() => {
    if (activeTab === TabNames.MODGPT && scrollContainerRef.current !== null) {
      scrollContainerRef.current.scrollTop = savedScrollPositionRef.current;
    }
  }, [activeTab]);

  let handleScroll = () => {
    if (activeTab === TabNames.MODGPT && scrollContainerRef.current !== null) {
      savedScrollPositionRef.current = scrollContainerRef.current.scrollTop;
    }
  };

  let reduceContents = (
    acc: TabsWithContents,
    { value, content }: TabContent,
  ) => [
    ...acc.contents,
    <TabsContent
      key={value}
      className="scrollWindow mt-0 h-full overflow-y-auto bg-gray-bg-light pt-[2.5rem] dark:bg-gray-darker"
      value={value}
      onScroll={handleScroll}
      ref={scrollContainerRef}
    >
      {content}
    </TabsContent>,
  ];

  let tabsData = useTabs({
    beforePanel,
    afterPanel,
    isSignedIn,
    showBuildPanel,
    engine,
    panelRefs,
  })
    .filter(Boolean)
    .reduce(
      (acc: TabsWithContents, curr) => ({
        tabs: reduceTabs(acc, curr),
        contents: reduceContents(acc, curr),
      }),
      { tabs: [], contents: [] },
    );

  if (engine === "ts-morph") {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Text>The Assistant is not yet available for TS-Morph codemods.</Text>
      </div>
    );
  }

  return (
    <Tabs
      value={activeTab}
      className="h-full w-full"
      onValueChange={(value: string) => {
        handleOnClick(value as TabNames);
      }}
    >
      <TabsList
        className={cn("absolute h-[2.5rem] w-full rounded-none z-1", {
          "z-[100]": isSignedIn,
        })}
      >
        {...tabsData.tabs}
      </TabsList>

      {...tabsData.contents}
    </Tabs>
  );
};
