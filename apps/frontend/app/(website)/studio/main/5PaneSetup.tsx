import ChevronRightSVG from "@/assets/icons/chevronright.svg";
import { cn } from "@/utils";
import { SignInButton, useAuth } from "@clerk/nextjs";
import type { KnownEngines } from "@codemod-com/utilities";
import { useTheme } from "@context/useTheme";
import getAccessToken from "@studio/api/getAccessToken";
import { getCodeDiff } from "@studio/api/getCodeDiff";
import Panel from "@studio/components/Panel";
import ResizeHandle from "@studio/components/ResizePanel/ResizeHandler";
import Text from "@studio/components/Text";
import InsertExampleButton from "@studio/components/button/InsertExampleButton";
import Chat from "@studio/components/chatbot/Chat";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@studio/components/ui/alert-dialog";
import { Button } from "@studio/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@studio/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@studio/components/ui/tabs";
import { UserIcon } from "@studio/icons/User";
import { SEARCH_PARAMS_KEYS } from "@studio/store/getInitialState";
import { useSnippetStore } from "@studio/store/zustand/snippets";
import { TabNames, useViewStore } from "@studio/store/zustand/view";
import { openLink } from "@studio/utils/openLink";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
// import toast from "react-hot-toast";
import { PanelGroup } from "react-resizable-panels";
import themeConfig from "../../../../tailwind.config";
import Codemod from "./Codemod";
import Header from "./Header";
import Layout from "./Layout";
import LiveIcon from "./LiveIcon";
import Table from "./Log/Table";
import {
  AstSection,
  BoundResizePanel,
  CodeSnippets,
  type PanelData,
  type PanelsRefs,
  ResizablePanelsIndices,
  ShowPanelTile,
} from "./PageBottomPane";
import { useSnippetsPanels } from "./PageBottomPane/hooks";

let enginesConfig: Array<{
  label: string;
  disabled: boolean;
  value: KnownEngines | "piranha";
}> = [
  {
    label: "jscodeshift",
    value: "jscodeshift",
    disabled: false,
  },
  {
    label: "ts-morph [beta]",
    value: "ts-morph",
    disabled: false,
  },
  {
    label: "piranha (alpha)",
    value: "piranha",
    disabled: true,
  },
];

let LEARN_KEY = "learn";
let ACCESS_TOKEN_REQUESTED_BY_VSCE_STORAGE_KEY_1 = "accessTokenRequested"; // For backwards-compatibility
let ACCESS_TOKEN_REQUESTED_BY_VSCE_STORAGE_KEY_2 =
  "accessTokenRequestedByVSCE";
let ACCESS_TOKEN_REQUESTED_BY_CLI_STORAGE_KEY = "accessTokenRequestedByCLI";
let ACCESS_TOKEN_COMMANDS = [
  ACCESS_TOKEN_REQUESTED_BY_VSCE_STORAGE_KEY_1,
  ACCESS_TOKEN_REQUESTED_BY_VSCE_STORAGE_KEY_2,
  ACCESS_TOKEN_REQUESTED_BY_CLI_STORAGE_KEY,
];
let TWO_MINS_IN_MS = 2 * 60 * 1000;

let routeUserToVSCodeWithAccessToken = async (clerkToken: string) => {
  let accessTokenEither = await getAccessToken({
    clerkToken,
  });

  if (accessTokenEither.isLeft()) {
    console.error(accessTokenEither.getLeft());
    return;
  }
  let accessToken = accessTokenEither.get();

  let vscodeUrl = new URL("vscode://codemod.codemod-vscode-extension/");
  let searchParams = new URLSearchParams();

  searchParams.set(SEARCH_PARAMS_KEYS.ACCESS_TOKEN, accessToken);
  vscodeUrl.search = searchParams.toString();
  openLink(vscodeUrl.toString());
};

let Main = () => {
  let { isSignedIn, getToken } = useAuth();
  let router = useRouter();
  let panelRefs: PanelsRefs = useRef({});
  let { beforePanel, afterPanel, outputPanel, codeDiff, onlyAfterHidden } =
    useSnippetsPanels({ panelRefs });

  let { engine, setEngine } = useSnippetStore();
  let { toggleTheme, isDark } = useTheme();
  // const executionId = "id"; // TODO: replace it with real id
  // const executionStatus = useExecutionStatus(executionId) ?? {
  // 	// TODO: Remove dummy data
  // 	status: "progress",
  // 	statusMessage: "processed 100 files",
  // 	result: null,
  // 	progressInfo: { processed: 100, total: 300 },
  // };

  let onEngineChange = (value: (typeof enginesConfig)[number]["value"]) => {
    setEngine(value as KnownEngines);
  };

  // useEffect(() => {
  // 	if (executionStatus === null) {
  // 		return;
  // 	}
  // 	const { status, statusMessage, result } = executionStatus;
  // 	if (status === "done") {
  // 		toast.success(
  // 			result === null
  // 				? statusMessage
  // 				: `${statusMessage}\nGo to ${result.link} to see the results.`,
  // 			{ duration: 6000 },
  // 		);
  // 	}
  // 	if (status === "progress") {
  // 		toast(statusMessage, {
  // 			icon: "🚧",
  // 		});
  // 	}
  // }, [executionStatus]);

  let snippetStore = useSnippetStore();

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }
    (async () => {
      let clerkToken = await getToken();
      if (clerkToken === null) {
        return;
      }
      let timestamp =
        localStorage.getItem(ACCESS_TOKEN_REQUESTED_BY_VSCE_STORAGE_KEY_1) ??
        localStorage.getItem(ACCESS_TOKEN_REQUESTED_BY_VSCE_STORAGE_KEY_2) ??
        localStorage.getItem(ACCESS_TOKEN_REQUESTED_BY_CLI_STORAGE_KEY);

      if (
        timestamp === null ||
        new Date().getTime() - Number.parseInt(timestamp, 10) > TWO_MINS_IN_MS
      ) {
        return;
      }

      if (localStorage.getItem(ACCESS_TOKEN_REQUESTED_BY_CLI_STORAGE_KEY)) {
        let [sessionId, iv] =
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
        await routeUserToVSCodeWithAccessToken(clerkToken);
      }
      ACCESS_TOKEN_COMMANDS.forEach((key) => localStorage.removeItem(key));
    })();
  }, [isSignedIn, getToken]);

  useEffect(() => {
    let searchParams = new URLSearchParams(window.location.search);
    let command = searchParams.get(SEARCH_PARAMS_KEYS.COMMAND);

    if (command === null || !ACCESS_TOKEN_COMMANDS.includes(command)) {
      return;
    }

    if (isSignedIn) {
      (async () => {
        let clerkToken = await getToken();
        if (clerkToken === null) {
          return;
        }
        if (command === ACCESS_TOKEN_REQUESTED_BY_CLI_STORAGE_KEY) {
          let sessionId = searchParams.get(SEARCH_PARAMS_KEYS.SESSION_ID);
          let iv = searchParams.get(SEARCH_PARAMS_KEYS.IV);

          // Polling should pick it up
          await getAccessToken({
            clerkToken,
            sessionId,
            iv,
          });
        }

        await routeUserToVSCodeWithAccessToken(clerkToken);
      })();
      return;
    }

    if (command === ACCESS_TOKEN_REQUESTED_BY_CLI_STORAGE_KEY) {
      let sessionId = searchParams.get(SEARCH_PARAMS_KEYS.SESSION_ID);
      let iv = searchParams.get(SEARCH_PARAMS_KEYS.IV);

      localStorage.setItem(command, [sessionId, iv].join(","));
    } else {
      localStorage.setItem(command, new Date().getTime().toString());
    }

    router.push("/auth/sign-in");
  }, [getToken, isSignedIn, router]);

  useEffect(() => {
    let searchParams = new URLSearchParams(window.location.search);
    let command = searchParams.get(SEARCH_PARAMS_KEYS.COMMAND);

    if (command === LEARN_KEY) {
      (async () => {
        try {
          let engine = (searchParams.get(SEARCH_PARAMS_KEYS.ENGINE) ??
            "jscodeshift") as KnownEngines;
          let diffId = searchParams.get(SEARCH_PARAMS_KEYS.DIFF_ID);
          let iv = searchParams.get(SEARCH_PARAMS_KEYS.IV);

          if (!engine || !diffId || !iv) {
            return;
          }

          let snippets = await getCodeDiff({ diffId, iv });

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

  let codemodHeader = (
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

  let beforeAfterBottomPanels = (
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

  let outputBottomPanel = (
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

function SignInRequired() {
  let theme = useTheme();
  let router = useRouter();
  let signUserIn = () => {
    router.push("/auth/sign-in");
  };

  return (
    <div className="grid h-full absolute top-0 bottom-0 w-full">
      <div className="absolute top-0 left-0 right-0 bottom-0 w-full h-full blur-sm backdrop-blur-sm" />
      <section
        className={
          "flex items-center flex-col gap-3 p-4 w-60 text-lg relative rounded-lg place-self-center border border-solid bg-background border-gray-200 dark:border-gray-700"
        }
        style={{
          backgroundImage:
            "linear-gradient(0deg, rgba(187, 252, 3, 0.3) 0, rgb(83 35 130 / 0%) 70%)",
        }}
      >
        <UserIcon
          stroke={
            theme.isDark
              ? themeConfig.theme.extend.colors["gray-bg-light"]
              : themeConfig.theme.extend.colors["gray-dark"]
          }
        />
        <p className="font-bold text-lg">Sign in required</p>
        <p className="font-normal text-sm text-center">
          Sign in to use AI assistant to build codemod
        </p>
        <Button
          onClick={signUserIn}
          className="flex w-full text-white gap-2 items-center"
        >
          Sign in <Image src={ChevronRightSVG} className="w-1.5" alt="" />
        </Button>
      </section>
    </div>
  );
}

let LoginWarningModal = () => {
  let { isSignedIn, isLoaded } = useAuth();
  let isFromCLI = useSearchParams().get("command") === LEARN_KEY;
  let [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    setIsOpen(isFromCLI && isLoaded && !isSignedIn);
  }, [isFromCLI, isSignedIn, isLoaded]);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unlock AI&apos;s full potential</AlertDialogTitle>
        </AlertDialogHeader>

        <p>
          Sign in to Codemod & let AI automatically create your codemod.
          Alternatively, proceed to Codemod Studio & create your codemod with
          non-AI tools.
        </p>

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="secondary">Proceed without AI</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <SignInButton>
              <Button>Sign in</Button>
            </SignInButton>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

let AssistantTab = ({
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
        <TabsTrigger className="flex-1" value={TabNames.MODGPT}>
          ModGPT
        </TabsTrigger>
        <TabsTrigger className="flex-1" value={TabNames.AST}>
          AST
        </TabsTrigger>
        <TabsTrigger className="flex-1" value={TabNames.DEBUG}>
          <LiveIcon />
          Debug
        </TabsTrigger>
      </TabsList>

      <TabsContent
        className="scrollWindow mt-0 h-full overflow-y-auto bg-gray-bg-light pt-[2.5rem] dark:bg-gray-darker"
        value={TabNames.AST}
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        <PanelGroup direction="horizontal">
          <AstSection
            panels={[beforePanel, afterPanel]}
            engine={engine}
            panelRefs={panelRefs}
          />
        </PanelGroup>
      </TabsContent>

      <TabsContent
        className="scrollWindow mt-0 h-full overflow-y-auto bg-gray-bg-light pt-[2.5rem] dark:bg-gray-darker"
        value={TabNames.MODGPT}
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        <Chat />
        {!isSignedIn && <SignInRequired />}
      </TabsContent>
      <TabsContent
        className="mt-0 h-full pt-[2.5rem] overflow-auto"
        value={TabNames.DEBUG}
      >
        <Table />
      </TabsContent>
    </Tabs>
  );
};

export default Main;
