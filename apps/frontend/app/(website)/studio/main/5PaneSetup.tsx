import {
  ACCESS_TOKEN_COMMANDS,
  ACCESS_TOKEN_REQUESTED_BY_CLI_STORAGE_KEY,
  ACCESS_TOKEN_REQUESTED_BY_CURSOR_STORAGE_KEY,
  CURSOR_PREFIX,
  LEARN_KEY,
  TWO_MINS_IN_MS,
  VSCODE_PREFIX,
} from "@/constants";
import { cn } from "@/utils";
import { useAuth } from "@clerk/nextjs";
import type { KnownEngines } from "@codemod-com/utilities";
import { useTheme } from "@context/useTheme";
import getAccessToken from "@studio/api/getAccessToken";
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
import { useSnippetStore } from "@studio/store/zustand/snippets";
import { openIDELink } from "@studio/utils/openIDELink";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { PanelGroup } from "react-resizable-panels";
import { useExecutionStatus } from "../src/hooks/useExecutionStatus";
import { useUserSession } from "../src/store/zustand/userSession";
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
  const { isSignedIn, getToken } = useAuth();
  const router = useRouter();
  const panelRefs: PanelsRefs = useRef({});
  const { beforePanel, afterPanel, outputPanel, codeDiff, onlyAfterHidden } =
    useSnippetsPanels({ panelRefs });

  const { engine, setEngine } = useSnippetStore();
  const { isDark } = useTheme();
  const { codemodExecutionId } = useUserSession();
  const executionStatus = useExecutionStatus(codemodExecutionId);

  const onEngineChange = (value: (typeof enginesConfig)[number]["value"]) => {
    setEngine(value as KnownEngines);
  };

  useEffect(() => {
    if (executionStatus === null) {
      return;
    }

    const { result, success } = executionStatus;

    if (!success || result === null) {
      return;
    }

    const { status, message } = result;

    if (status === "done") {
      toast.success(
        result === null
          ? message
          : `${message}\nGo to ${result.link} to see the results.`,
        { duration: 6000 },
      );
    }
    if (status === "progress") {
      toast(message, {
        icon: "🚧",
      });
    }
  }, [executionStatus]);

  const snippetStore = useSnippetStore();

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }
    (async () => {
      const clerkToken = await getToken();
      if (clerkToken === null) {
        return;
      }
      const timestamp =
        ACCESS_TOKEN_COMMANDS.find((x) => localStorage.getItem(x)) ?? null;

      if (
        timestamp === null ||
        new Date().getTime() - Number.parseInt(timestamp, 10) > TWO_MINS_IN_MS
      ) {
        return;
      }

      if (localStorage.getItem(ACCESS_TOKEN_REQUESTED_BY_CLI_STORAGE_KEY)) {
        const [sessionId, iv] =
          localStorage
            .getItem(ACCESS_TOKEN_REQUESTED_BY_CLI_STORAGE_KEY)
            ?.split(",") || [];

        // Polling should pick it up
        await getAccessToken({
          clerkToken,
          sessionId,
          iv,
        });
      } else {
        await openIDELink(
          clerkToken,
          localStorage.getItem(ACCESS_TOKEN_REQUESTED_BY_CURSOR_STORAGE_KEY)
            ? CURSOR_PREFIX
            : VSCODE_PREFIX,
        );
      }
      ACCESS_TOKEN_COMMANDS.forEach((key) => localStorage.removeItem(key));
    })();
  }, [isSignedIn, getToken]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const command = searchParams.get(SEARCH_PARAMS_KEYS.COMMAND);

    if (command === null || !ACCESS_TOKEN_COMMANDS.includes(command)) {
      return;
    }

    if (isSignedIn) {
      (async () => {
        const clerkToken = await getToken();
        if (clerkToken === null) {
          return;
        }
        if (command === ACCESS_TOKEN_REQUESTED_BY_CLI_STORAGE_KEY) {
          const sessionId = searchParams.get(SEARCH_PARAMS_KEYS.SESSION_ID);
          const iv = searchParams.get(SEARCH_PARAMS_KEYS.IV);

          // Polling should pick it up
          await getAccessToken({
            clerkToken,
            sessionId,
            iv,
          });
          return;
        }

        await openIDELink(
          clerkToken,
          command === ACCESS_TOKEN_REQUESTED_BY_CURSOR_STORAGE_KEY
            ? CURSOR_PREFIX
            : VSCODE_PREFIX,
        );
      })();
      return;
    }

    if (command === ACCESS_TOKEN_REQUESTED_BY_CLI_STORAGE_KEY) {
      const sessionId = searchParams.get(SEARCH_PARAMS_KEYS.SESSION_ID);
      const iv = searchParams.get(SEARCH_PARAMS_KEYS.IV);

      localStorage.setItem(command, [sessionId, iv].join(","));
    } else {
      localStorage.setItem(command, new Date().getTime().toString());
    }

    router.push("/auth/sign-in");
  }, [getToken, isSignedIn, router]);

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

          snippetStore.setInput(snippets.before);
          snippetStore.setOutput(snippets.after);
          snippetStore.setEngine(engine);
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
            {/* <DownloadZip />
						<ClearInputButton /> */}
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
                  className="bg-gray-bg"
                >
                  <AssistantTab
                    panelRefs={panelRefs}
                    beforePanel={beforePanel}
                    afterPanel={afterPanel}
                  />
                </BoundResizePanel>
                <ResizeHandle direction="vertical" />
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
                  className="bg-gray-bg"
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
