import { LEARN_KEY } from "@/constants";
import { cn } from "@/utils";
import { useAiService } from "@chatbot/useAiService";
import type { KnownEngines } from "@codemod-com/utilities";
import { useTheme } from "@context/useTheme";
import { getCodeDiff } from "@studio/api/getCodeDiff";
import Panel from "@studio/components/Panel";
import { BoundResizePanel } from "@studio/components/ResizePanel/BoundResizePanel";
import ResizeHandle from "@studio/components/ResizePanel/ResizeHandler";
import InsertExampleButton from "@studio/components/button/InsertExampleButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@studio/components/ui/select";
import { VisibilityIcon } from "@studio/icons";
import { TestTabsComponent } from "@studio/main/PageBottomPane/TestTabsComponent";
import { AssistantTab } from "@studio/main/PaneLayout";
import { LoginWarningModal } from "@studio/main/PaneLayout/LoginWarningModal";
import { enginesConfig } from "@studio/main/PaneLayout/enginesConfig";
import { useCFSStore } from "@studio/store/CFS";
import { SEARCH_PARAMS_KEYS } from "@studio/store/initialState";
import { useModStore } from "@studio/store/mod";
import { useSnippetsStore } from "@studio/store/snippets";
import { useEffect, useRef } from "react";
import { PanelGroup } from "react-resizable-panels";
import Codemod from "./Codemod";
import { Header } from "./Header/Header";
import Layout from "./Layout";
import {
  CodeSnippets,
  type PanelsRefs,
  ResizablePanelsIndices,
} from "./PageBottomPane";
import { useSnippetsPanels } from "./PageBottomPane/hooks";

const Main = () => {
  const panelRefs: PanelsRefs = useRef({});
  const { beforePanel, afterPanel, outputPanel, codeDiff, onlyAfterHidden } =
    useSnippetsPanels({ panelRefs });

  const { engine, setEngine, getSelectedEditors } = useSnippetsStore();
  const { isDark } = useTheme();
  const { setContent } = useModStore();
  const {
    AIAssistant: { engine: llmEngine },
  } = useCFSStore();

  const aiAssistantData = useAiService({
    setCodemod: setContent,
    engine: llmEngine,
  });
  const onEngineChange = (value: (typeof enginesConfig)[number]["value"]) => {
    setEngine(value as KnownEngines);
  };

  const snippetStore = getSelectedEditors();

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
        className="before-and-after-panels"
        codeDiff={codeDiff}
        onlyAfterHidden={onlyAfterHidden}
        panelRefs={panelRefs}
        panels={[beforePanel, afterPanel]}
      >
        {onlyAfterHidden && (
          <div
            className="hidden_panel_indicator"
            onClick={() => {
              afterPanel.visibilityOptions?.show();
              panelRefs.current[ResizablePanelsIndices.AFTER_SNIPPET]?.resize(
                50,
              );
            }}
          >
            <VisibilityIcon visibilityOptions={afterPanel.visibilityOptions} />
            <span className="hidden_panel_indicator_text">After</span>
          </div>
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

  const tabsPanel = (
    <BoundResizePanel
      panelRefIndex={ResizablePanelsIndices.TAB_SECTION}
      boundedIndex={ResizablePanelsIndices.BEFORE_AFTER_COMBINED}
      panelRefs={panelRefs}
      className="bg-gray-bg assistant"
    >
      <AssistantTab
        aiAssistantData={aiAssistantData}
        panelRefs={panelRefs}
        beforePanel={beforePanel}
        afterPanel={afterPanel}
      />
    </BoundResizePanel>
  );

  const beforeAndAfterPanel = (
    <BoundResizePanel
      panelRefIndex={ResizablePanelsIndices.BEFORE_AFTER_COMBINED}
      boundedIndex={ResizablePanelsIndices.TAB_SECTION}
      panelRefs={panelRefs}
      className="bg-gray-bg"
    >
      {beforeAfterBottomPanels}
    </BoundResizePanel>
  );

  const codemodPanel = (
    <BoundResizePanel
      panelRefIndex={ResizablePanelsIndices.CODEMOD_SECTION}
      panelRefs={panelRefs}
      className="bg-gray-bg codemod"
    >
      {codemodHeader}
      <Codemod />
    </BoundResizePanel>
  );

  const outputPanelD = (
    <BoundResizePanel
      panelRefIndex={ResizablePanelsIndices.OUTPUT_AST}
      panelRefs={panelRefs}
      className="bg-gray-bg"
    >
      {outputBottomPanel}
    </BoundResizePanel>
  );

  return (
    <>
      <LoginWarningModal />

      <Layout>
        <Layout.Header>
          <Header />
        </Layout.Header>
        <Layout.Content gap="gap-2">
          <PanelGroup autoSaveId="main-layout" direction="vertical">
            <BoundResizePanel
              panelRefs={panelRefs}
              panelRefIndex={ResizablePanelsIndices.TOP}
            >
              <PanelGroup direction="horizontal">
                {tabsPanel}
                <ResizeHandle direction="horizontal" />
                {codemodPanel}
              </PanelGroup>
            </BoundResizePanel>
            <ResizeHandle direction="vertical" />
            <BoundResizePanel
              panelRefIndex={ResizablePanelsIndices.BOTTOM}
              panelRefs={panelRefs}
              className="bg-gray-bg"
            >
              <TestTabsComponent
                autogenerateTestCases={aiAssistantData.autogenerateTestCases}
              />
              <PanelGroup direction="horizontal">
                {beforeAndAfterPanel}
                <ResizeHandle direction="horizontal" />
                {outputPanelD}
              </PanelGroup>
            </BoundResizePanel>
          </PanelGroup>
        </Layout.Content>
      </Layout>
    </>
  );
};

export default Main;
