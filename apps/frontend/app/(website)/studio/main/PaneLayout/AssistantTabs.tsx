import { cn } from "@/utils";
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
  useTabsData,
} from "@studio/main/PaneLayout/tabsData";
import { useSnippetsStore } from "@studio/store/snippets";
import { TabNames, useViewStore } from "@studio/store/view";
import { useCallback, useEffect, useRef } from "react";

const reduceTabs = (acc: TabsWithContents, { value, name }: TabHeader) => [
  ...acc.tabs,
  <TabsTrigger key={value} className="flex-1" value={value}>
    {name}
  </TabsTrigger>,
];

export const AssistantTab = ({
  panelRefs,
  beforePanel,
  afterPanel,
}: {
  panelRefs: PanelsRefs;
  beforePanel: PanelData;
  afterPanel: PanelData;
}) => {
  const { activeTab } = useViewStore();
  const { engine } = useSnippetsStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const savedScrollPositionRef = useRef<number>(0);
  const { isSignedIn } = useAuth();

  const { setActiveTab } = useViewStore();

  const handleOnClick = useCallback(
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

  const handleScroll = () => {
    if (activeTab === TabNames.MODGPT && scrollContainerRef.current !== null) {
      savedScrollPositionRef.current = scrollContainerRef.current.scrollTop;
    }
  };

  const reduceContents = (
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

  const tabsData = useTabsData({
    beforePanel,
    afterPanel,
    isSignedIn,
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
          "z-[30]": !isSignedIn,
        })}
      >
        {...tabsData.tabs}
      </TabsList>

      {...tabsData.contents}
    </Tabs>
  );
};
