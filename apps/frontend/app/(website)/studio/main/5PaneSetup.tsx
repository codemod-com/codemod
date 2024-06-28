import { LEARN_KEY } from "@/constants";
import { cn } from "@/utils";
import type { KnownEngines } from "@codemod-com/utilities";
import { useTheme } from "@context/useTheme";
import { getCodeDiff } from "@studio/api/getCodeDiff";
import Panel from "@studio/components/Panel";
import ResizeHandle from "@studio/components/ResizePanel/ResizeHandler";
import InsertExampleButton from "@studio/components/button/InsertExampleButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@studio/components/ui/select";
import { AssistantTab } from "@studio/main/PaneLayout";
import { LoginWarningModal } from "@studio/main/PaneLayout/LoginWarningModal";
import { enginesConfig } from "@studio/main/PaneLayout/enginesConfig";
import { SEARCH_PARAMS_KEYS } from "@studio/store/getInitialState";
import { useSnippetsStore } from "@studio/store/snippets";
import { useEffect, useRef } from "react";
import { PanelGroup } from "react-resizable-panels";
import Codemod from "./Codemod";
import { Header } from "./Header/Header";
import Layout from "./Layout";
import {
  BoundResizePanel,
  CodeSnippets,
  type PanelsRefs,
  ResizablePanelsIndices,
  ShowPanelTile,
} from "./PageBottomPane";
import { useSnippetsPanels } from "./PageBottomPane/hooks";

const Main = () => {
  const panelRefs: PanelsRefs = useRef({});
  const { beforePanel, afterPanel, outputPanel, codeDiff, onlyAfterHidden } =
    useSnippetsPanels({ panelRefs });

  const {
    engine,
    setEngine,
    getSelectedEditors,
    editors,
    removePair,
    setSelectedPairIndex,
    addPair,
  } = useSnippetsStore();
  const { isDark } = useTheme();

  const onEngineChange = (value: (typeof enginesConfig)[number]["value"]) => {
    setEngine(value as KnownEngines);
  };

  const snippetStore = getSelectedEditors();

  const TripletSelector = () => (
    <ul className="flex">
      {editors.map((_, i) => (
        <>
          <li
            className="cursor-pointer mx-2 hover:text-red-600"
            onClick={() => setSelectedPairIndex(i)}
            key={i}
          >
            pair: {i}
          </li>
          {/*<button onClick={ () => removePair(i) }>remove</button>*/}
        </>
      ))}
      <li onClick={addPair} className="cursor-pointer mx-2 hover:text-red-600">
        Add snippet
      </li>
    </ul>
  );
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const command = searchParams.get(SEARCH_PARAMS_KEYS.COMMAND);

    if (command === LEARN_KEY) {
      (async () => {
        try {
          const engine = (searchParams.get(SEARCH_PARAMS_KEYS.ENGINE) ??
            "jscodeshift") as KnownEngines;
          const diffId = searchParams.get(SEARCH_PARAMS_KEYS.DIFF_ID);
          const iv = searchParams.get(SEARCH_PARAMS_KEYS.IV);

          if (!engine || !diffId || !iv) {
            return;
          }

          const snippets = await getCodeDiff({ diffId, iv });

          if (!snippets) {
            return;
          }

          snippetStore.setBeforeSnippet(snippets.before);
          snippetStore.setAfterSnippet(snippets.after);
          setEngine(engine);
        } catch (err) {
          console.error(err);
        }
      })();
      return;
    }
  }, [snippetStore]);

  const codemodHeader = (
    <Panel.Header className="h-[30px]">
      <Panel.HeaderTab>
        <Panel.HeaderTitle className="h-full">
          Codemod
          <div className="flex items-center gap-1">
            <Select onValueChange={onEngineChange} value={engine}>
              <SelectTrigger className="flex flex-1 h-full select-none items-center font-semibold">
                <span
                  className={cn(
                    "mr-[0.75rem] text-xs font-light text-slate-500",
                    {
                      "text-slate-200": isDark,
                    },
                  )}
                >
                  Engine:
                </span>
                <SelectValue placeholder={engine} />
              </SelectTrigger>
              <SelectContent>
                {enginesConfig.map((engineConfig, i) => (
                  <SelectItem
                    disabled={engineConfig.disabled}
                    key={i}
                    value={engineConfig.value}
                    className={cn({
                      "font-semibold": engine === engineConfig.value,
                    })}
                  >
                    {engineConfig.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <InsertExampleButton />
          </div>
        </Panel.HeaderTitle>
      </Panel.HeaderTab>
    </Panel.Header>
  );

  const beforeAfterBottomPanels = (
    <>
      <CodeSnippets
        key="before-and-after-panels"
        className="before-and-after-panels"
        codeDiff={codeDiff}
        onlyAfterHidden={onlyAfterHidden}
        panelRefs={panelRefs}
        panels={[beforePanel, afterPanel]}
      >
        {onlyAfterHidden && (
          <ShowPanelTile
            header="After"
            panel={afterPanel}
            onClick={() => {
              afterPanel.visibilityOptions?.show();
              panelRefs.current[ResizablePanelsIndices.AFTER_SNIPPET]?.resize(
                50,
              );
            }}
          />
        )}
      </CodeSnippets>
    </>
  );

  const outputBottomPanel = (
    <CodeSnippets
      className="output-panel"
      codeDiff={codeDiff}
      onlyAfterHidden={onlyAfterHidden}
      panelRefs={panelRefs}
      panels={[outputPanel]}
    />
  );

  return (
    <>
      <LoginWarningModal />

      <Layout>
        <Layout.Header>
          <Header />
        </Layout.Header>
        <Layout.Content gap="gap-2">
          <PanelGroup autoSaveId="main-layout" direction="horizontal">
            <BoundResizePanel
              panelRefIndex={ResizablePanelsIndices.LEFT}
              panelRefs={panelRefs}
              className="bg-gray-bg"
            >
              <PanelGroup direction="vertical">
                <BoundResizePanel
                  panelRefIndex={ResizablePanelsIndices.TAB_SECTION}
                  boundedIndex={ResizablePanelsIndices.CODEMOD_SECTION}
                  panelRefs={panelRefs}
                  className="bg-gray-bg assistant"
                >
                  <AssistantTab
                    panelRefs={panelRefs}
                    beforePanel={beforePanel}
                    afterPanel={afterPanel}
                  />
                </BoundResizePanel>
                <ResizeHandle direction="vertical" />
                <TripletSelector />
                <BoundResizePanel
                  panelRefIndex={ResizablePanelsIndices.BEFORE_AFTER_COMBINED}
                  panelRefs={panelRefs}
                  className="bg-gray-bg"
                >
                  {beforeAfterBottomPanels}
                </BoundResizePanel>
              </PanelGroup>
            </BoundResizePanel>

            <ResizeHandle direction="horizontal" />
            <BoundResizePanel
              panelRefs={panelRefs}
              panelRefIndex={ResizablePanelsIndices.RIGHT}
            >
              <PanelGroup direction="vertical">
                <BoundResizePanel
                  panelRefIndex={ResizablePanelsIndices.CODEMOD_SECTION}
                  boundedIndex={ResizablePanelsIndices.TAB_SECTION}
                  panelRefs={panelRefs}
                  className="bg-gray-bg codemod"
                >
                  {codemodHeader}
                  <Codemod />
                </BoundResizePanel>
                <ResizeHandle direction="vertical" />
                <BoundResizePanel
                  panelRefIndex={ResizablePanelsIndices.OUTPUT_AST}
                  panelRefs={panelRefs}
                  className="bg-gray-bg"
                >
                  {outputBottomPanel}
                </BoundResizePanel>
              </PanelGroup>
            </BoundResizePanel>
          </PanelGroup>
        </Layout.Content>
      </Layout>
    </>
  );
};

export default Main;
