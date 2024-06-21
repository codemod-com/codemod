import axios from "axios";
import areEqual from "fast-deep-equal";
import { glob } from "glob";
import {
  type ExtensionContext,
  Uri,
  type WebviewView,
  type WebviewViewProvider,
  commands,
  window,
  workspace,
} from "vscode";
import type { Store } from "../../data";
import { actions } from "../../data/slice";
import { createIssueResponseCodec } from "../../github/types";
import {
  type CodemodNodeHashDigest,
  relativeToAbsolutePath,
  selectCodemodArguments,
} from "../../selectors/selectCodemodTree";
import { selectMainWebviewViewProps } from "../../selectors/selectMainWebviewViewProps";
import { buildGlobPattern, isNeitherNullNorUndefined } from "../../utilities";
import type { EngineService } from "../engineService";
import { type MessageBus, MessageKind } from "../messageBus";
import { WebviewResolver } from "./WebviewResolver";
import type {
  CodemodHash,
  WebviewMessage,
  WebviewResponse,
} from "./webviewEvents";

export const validateAccessToken = async (
  accessToken: string,
): Promise<void> => {
  try {
    const response = await axios.post(
      "https://backend.codemod.com/verifyToken",
      {},
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 5000,
      },
    );

    return response.data;
  } catch (error) {
    if (!axios.isAxiosError(error)) {
      console.error(error);
    }
  }
};

export const createIssue = async (
  title: string,
  body: string,
  accessToken: string,
  onSuccess: () => void,
  onFail: () => Promise<void>,
): Promise<{ status: number; html_url: string | null }> => {
  // call API to create Github Issue
  const codemodRegistryRepoUrl = "https://github.com/codemod-com/codemod";

  const result = await axios.post(
    "https://backend.codemod.com/sourceControl/github/issues",
    { title, body, repoUrl: codemodRegistryRepoUrl },
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (result.status !== 200) {
    await onFail();
    return { status: result.status, html_url: null };
  }

  const { data } = result;

  const validation = createIssueResponseCodec.decode(data);

  if (validation._tag === "Left") {
    await onFail();
    window.showErrorMessage("Creating Github issue failed.");
    return { status: 406, html_url: null };
  }

  onSuccess();

  const decision = await window.showInformationMessage(
    "Github issue is successfully created.",
    "See issue in Github",
  );
  const { html_url } = validation.right;
  if (decision === "See issue in Github") {
    commands.executeCommand("codemod.redirect", html_url);
  }
  return {
    status: 200,
    html_url,
  };
};

export class MainViewProvider implements WebviewViewProvider {
  private __view: WebviewView | null = null;
  private __webviewResolver: WebviewResolver;
  private __executionQueue: ReadonlyArray<CodemodHash> = [];
  private __directoryPaths: ReadonlyArray<string> | null = null;
  // true by default to prevent banner blinking on load
  private __codemodEngineNodeLocated = true;

  constructor(
    context: ExtensionContext,
    private readonly __engineService: EngineService,
    private readonly __messageBus: MessageBus,
    private readonly __rootUri: Uri | null,
    private readonly __store: Store,
  ) {
    this.__webviewResolver = new WebviewResolver(context.extensionUri);

    this.__messageBus.subscribe(MessageKind.showProgress, (message) => {
      if (message.codemodHash === null) {
        return;
      }

      this.__postMessage({
        kind: "webview.global.setCodemodExecutionProgress",
        codemodHash: message.codemodHash,
        progressKind: message.progressKind,
        totalFileNumber: message.totalFileNumber,
        processedFileNumber: message.processedFileNumber,
      });
    });

    this.__messageBus.subscribe(MessageKind.codemodSetExecuted, () => {
      this.__postMessage({
        kind: "webview.global.codemodExecutionHalted",
      });
    });

    this.__messageBus.subscribe(MessageKind.executeCodemodSet, () => {
      this.__store.dispatch(actions.collapseResultsPanel(false));
      this.__store.dispatch(actions.collapseChangeExplorerPanel(false));
    });

    this.__messageBus.subscribe(MessageKind.executionQueueChange, (message) => {
      this.__executionQueue = message.queuedCodemodHashes;
      const props = this.__buildProps();

      this.__postMessage({
        kind: "webview.main.setProps",
        props: props,
      });
    });

    this.__messageBus.subscribe(
      MessageKind.codemodEngineNodeLocated,
      ({ codemodEngineNodeLocated }) => {
        if (this.__codemodEngineNodeLocated === codemodEngineNodeLocated) {
          return;
        }

        this.__codemodEngineNodeLocated = codemodEngineNodeLocated;

        const props = this.__buildProps();

        this.__postMessage({
          kind: "webview.main.setProps",
          props,
        });
      },
    );

    let prevProps = this.__buildProps();

    this.__store.subscribe(async () => {
      if (this.__directoryPaths === null) {
        await this.__getDirectoryPaths();
      }

      const nextProps = this.__buildProps();
      if (areEqual(prevProps, nextProps)) {
        return;
      }

      prevProps = nextProps;

      this.__postMessage({
        kind: "webview.main.setProps",
        props: nextProps,
      });
    });
  }

  public isVisible(): boolean {
    return this.__view?.visible ?? false;
  }

  public resolveWebviewView(webviewView: WebviewView): void | Thenable<void> {
    this.__resolveWebview(webviewView);

    this.__view = webviewView;

    this.__view.webview.onDidReceiveMessage(this.__onDidReceiveMessage);

    this.__messageBus.publish({
      kind: MessageKind.mainWebviewViewVisibilityChange,
    });

    this.__view.onDidChangeVisibility(() => {
      this.__messageBus.publish({
        kind: MessageKind.mainWebviewViewVisibilityChange,
      });

      if (this.__view?.visible) {
        this.__resolveWebview(this.__view);
      }
    });
  }

  private async __getDirectoryPaths() {
    if (this.__rootUri === null) {
      return;
    }

    const globPattern = buildGlobPattern(this.__rootUri, "/**");

    // From `glob` documentation:
    // (Note: to match only directories, put a / at the end of the pattern.)
    const directoryPaths = await glob(`${globPattern}/`, {
      // ignore node_modules and files, match only directories
      ignore: ["**/node_modules/**"],
      follow: false,
      maxDepth: 10,
    });

    const MAX_NUMBER_OF_DIRECTORIES = 10000;

    this.__directoryPaths = directoryPaths.slice(0, MAX_NUMBER_OF_DIRECTORIES);
  }

  private __postMessage(message: WebviewMessage) {
    this.__view?.webview.postMessage(message);
  }

  private __resolveWebview(webviewView: WebviewView) {
    this.__webviewResolver.resolveWebview(
      webviewView.webview,
      "main",
      JSON.stringify(this.__buildProps()),
      "mainWebviewViewProps",
    );
  }

  private __buildProps() {
    return selectMainWebviewViewProps(
      this.__store.getState(),
      this.__rootUri,
      this.__directoryPaths,
      this.__executionQueue,
      this.__codemodEngineNodeLocated,
    );
  }

  private __onDidReceiveMessage = async (message: WebviewResponse) => {
    if (message.kind === "webview.command") {
      commands.executeCommand(
        message.value.command,
        ...(message.value.arguments ?? []),
      );
    }

    if (message.kind === "webview.campaignManager.setSelectedCaseHash") {
      this.__store.dispatch(actions.setSelectedCaseHash(message.caseHash));
    }

    if (message.kind === "webview.global.discardSelected") {
      commands.executeCommand("codemod.discardJobs", message.caseHashDigest);
    }

    if (message.kind === "webview.global.showInformationMessage") {
      window.showInformationMessage(message.value);
    }

    if (message.kind === "webview.global.applySelected") {
      commands.executeCommand(
        "codemod.sourceControl.saveStagedJobsToTheFileSystem",
        message.caseHashDigest,
      );
    }

    if (message.kind === "webview.main.setActiveTabId") {
      this.__store.dispatch(actions.setActiveTabId(message.activeTabId));
    }

    if (message.kind === "webview.main.setCodemodDiscoveryPanelGroupSettings") {
      this.__store.dispatch(
        actions.setCodemodDiscoveryPanelGroupSettings(
          message.panelGroupSettings,
        ),
      );
    }

    if (message.kind === "webview.main.setCodemodRunsPanelGroupSettings") {
      this.__store.dispatch(
        actions.setCodemodRunsPanelGroupSettings(message.panelGroupSettings),
      );
    }

    if (message.kind === "webview.main.setToaster") {
      this.__store.dispatch(actions.setToaster(message.value));
    }

    if (message.kind === "webview.global.flipSelectedExplorerNode") {
      this.__store.dispatch(
        actions.flipSelectedExplorerNode([
          message.caseHashDigest,
          message.explorerNodeHashDigest,
        ]),
      );
    }

    if (message.kind === "webview.global.flipCollapsibleExplorerNode") {
      this.__store.dispatch(
        actions.flipCollapsibleExplorerNode([
          message.caseHashDigest,
          message.explorerNodeHashDigest,
        ]),
      );
    }

    if (message.kind === "webview.global.focusExplorerNode") {
      this.__store.dispatch(
        actions.focusExplorerNode([
          message.caseHashDigest,
          message.explorerNodeHashDigest,
        ]),
      );
    }

    if (message.kind === "webview.global.setChangeExplorerSearchPhrase") {
      this.__store.dispatch(
        actions.setChangeExplorerSearchPhrase([
          message.caseHashDigest,
          message.searchPhrase,
        ]),
      );
    }

    if (message.kind === "webview.codemodList.haltCodemodExecution") {
      this.__engineService.shutdownEngines();
    }

    if (message.kind === "webview.codemodList.dryRunCodemod") {
      if (this.__rootUri === null) {
        window.showWarningMessage("No active workspace is found.");
        return;
      }

      const hashDigest = message.value;
      this.__store.dispatch(actions.setRecentCodemodHashes(hashDigest));

      const state = this.__store.getState().codemodDiscoveryView;
      const executionPath =
        state.executionPaths[hashDigest] ?? this.__rootUri.fsPath;

      if (executionPath === null) {
        return;
      }

      const uri = Uri.file(executionPath);

      // if missing some required arguments, open arguments popup

      const argumentsSpecified = selectCodemodArguments(
        this.__store.getState(),
        hashDigest as unknown as CodemodNodeHashDigest,
      ).every(
        ({ required, value }) =>
          !required || (isNeitherNullNorUndefined(value) && value !== ""),
      );

      if (!argumentsSpecified) {
        this.__store.dispatch(
          actions.setCodemodArgumentsPopupHashDigest(
            hashDigest as unknown as CodemodNodeHashDigest,
          ),
        );
        return;
      }

      commands.executeCommand("codemod.executeCodemod", uri, hashDigest);
    }

    if (message.kind === "webview.codemodList.updatePathToExecute") {
      await this.updateExecutionPath(message.value);

      this.__postMessage({
        kind: "webview.main.setProps",
        props: this.__buildProps(),
      });
    }

    if (message.kind === "webview.global.showWarningMessage") {
      window.showWarningMessage(message.value);
    }

    if (message.kind === "webview.global.flipCodemodHashDigest") {
      this.__store.dispatch(
        actions.flipCodemodHashDigest(message.codemodNodeHashDigest),
      );
    }

    if (message.kind === "webview.global.selectCodemodNodeHashDigest") {
      this.__store.dispatch(
        actions.setFocusedCodemodHashDigest(
          message.selectedCodemodNodeHashDigest,
        ),
      );
    }

    if (message.kind === "webview.global.setCodemodSearchPhrase") {
      this.__store.dispatch(
        actions.setCodemodSearchPhrase(message.searchPhrase),
      );
    }

    if (message.kind === "webview.global.collapseResultsPanel") {
      this.__store.dispatch(actions.collapseResultsPanel(message.collapsed));
    }

    if (message.kind === "webview.global.collapseChangeExplorerPanel") {
      this.__store.dispatch(
        actions.collapseChangeExplorerPanel(message.collapsed),
      );
    }

    if (message.kind === "webview.global.setCodemodArgumentsPopupHashDigest") {
      this.__store.dispatch(
        actions.setCodemodArgumentsPopupHashDigest(message.hashDigest),
      );
    }

    if (message.kind === "webview.global.setCodemodArgument") {
      this.__store.dispatch(
        actions.setCodemodArgument({
          hashDigest: message.hashDigest,
          name: message.name,
          value: message.value,
        }),
      );
    }
  };

  public updateExecutionPath = async ({
    newPath,
    codemodHash,
    errorMessage,
    warningMessage,
    revertToPrevExecutionIfInvalid,
    fromVSCodeCommand,
  }: {
    newPath: string;
    codemodHash: CodemodHash;
    errorMessage: string | null;
    warningMessage: string | null;
    revertToPrevExecutionIfInvalid: boolean;
    fromVSCodeCommand?: boolean;
  }) => {
    if (this.__rootUri === null) {
      window.showWarningMessage("No active workspace is found.");
      return;
    }

    const state = this.__store.getState().codemodDiscoveryView;
    const persistedExecutionPath = state.executionPaths[codemodHash];

    const oldExecutionPath = persistedExecutionPath ?? null;
    const newPathAbsolute = relativeToAbsolutePath(
      newPath,
      this.__rootUri.fsPath,
    );

    try {
      await workspace.fs.stat(Uri.file(newPathAbsolute));
      this.__store.dispatch(
        actions.setExecutionPath({
          codemodHash,
          path: newPathAbsolute,
        }),
      );

      if (!fromVSCodeCommand) {
        window.showInformationMessage(
          "Successfully updated the execution path.",
        );
      }
    } catch (e) {
      if (errorMessage !== null) {
        window.showErrorMessage(errorMessage);
      }
      if (warningMessage !== null) {
        window.showWarningMessage(warningMessage);
      }

      if (oldExecutionPath === null) {
        return;
      }

      if (revertToPrevExecutionIfInvalid) {
        this.__store.dispatch(
          actions.setExecutionPath({
            codemodHash,
            path: oldExecutionPath,
          }),
        );
      } else {
        this.__store.dispatch(
          actions.setExecutionPath({
            codemodHash,
            path: oldExecutionPath,
          }),
        );
      }
    }
  };
}
