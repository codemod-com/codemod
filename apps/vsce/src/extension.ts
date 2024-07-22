import * as vscode from "vscode";

import { createClearStateCommand } from "./commands/clearStateCommand";
import { BootstrapExecutablesService } from "./components/bootstrapExecutablesService";
import { DownloadService } from "./components/downloadService";
import { EngineService } from "./components/engineService";
import { FileService } from "./components/fileService";
import { FileSystemUtilities } from "./components/fileSystemUtilities";
import { type Command, MessageBus, MessageKind } from "./components/messageBus";
import { ErrorWebviewProvider } from "./components/webview/ErrorWebviewProvider";
import { MainViewProvider } from "./components/webview/MainProvider";
import { getConfiguration } from "./configuration";
import { buildContainer } from "./container";
import { buildStore } from "./data";
import { actions } from "./data/slice";
import type { CodemodHash } from "./packageJsonAnalyzer/types";
import {
  type CodemodNodeHashDigest,
  selectCodemodArguments,
} from "./selectors/selectCodemodTree";
import { generateDistinctId, getDistinctId } from "./telemetry/distinctId";
import { buildCaseHash } from "./telemetry/hashes";
import { buildTelemetryLogger } from "./telemetry/logger";
import { VscodeTelemetryReporter } from "./telemetry/reporter";
import { buildHash } from "./utilities";

export enum SEARCH_PARAMS_KEYS {
  ENGINE = "engine",
  BEFORE_SNIPPET = "beforeSnippet",
  AFTER_SNIPPET = "afterSnippet",
  CODEMOD_SOURCE = "codemodSource",
  CODEMOD_NAME = "codemodName",
  COMMAND = "command",
  COMPRESSED_SHAREABLE_CODEMOD = "c",
  CODEMOD_HASH_DIGEST = "chd",
}

const messageBus = new MessageBus();

export async function activate(context: vscode.ExtensionContext) {
  const rootUri = vscode.workspace.workspaceFolders?.[0]?.uri ?? null;

  messageBus.setDisposables(context.subscriptions);

  const { store } = await buildStore(context.workspaceState);

  let distinctId = await getDistinctId(context);

  if (distinctId === null) {
    distinctId = await generateDistinctId(context);
  }

  const configurationContainer = buildContainer(getConfiguration());

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(() => {
      configurationContainer.set(getConfiguration());
    }),
  );

  const fileService = new FileService(messageBus);

  const fileSystemUtilities = new FileSystemUtilities(vscode.workspace.fs);

  const downloadService = new DownloadService(
    vscode.workspace.fs,
    fileSystemUtilities,
  );

  const engineService = new EngineService(
    configurationContainer,
    messageBus,
    vscode.workspace.fs,
    store,
    rootUri?.fsPath ?? null,
  );

  const vscodeTelemetry = new VscodeTelemetryReporter(
    buildTelemetryLogger(distinctId),
    messageBus,
  );

  new BootstrapExecutablesService(
    downloadService,
    context.globalStorageUri,
    vscode.workspace.fs,
    messageBus,
    vscodeTelemetry,
  );

  const mainViewProvider = new MainViewProvider(
    context,
    engineService,
    messageBus,
    rootUri,
    store,
  );

  const mainView = vscode.window.registerWebviewViewProvider(
    "codemodMainView",
    mainViewProvider,
  );

  context.subscriptions.push(mainView);

  const errorWebviewProvider = new ErrorWebviewProvider(
    context,
    messageBus,
    store,
    mainViewProvider,
  );

  // this is only used by the codemod panel's webview
  context.subscriptions.push(
    vscode.commands.registerCommand("codemod.redirect", (arg0) => {
      try {
        vscode.env.openExternal(vscode.Uri.parse(arg0));
      } catch (e) {
        vscode.window.showWarningMessage(`Invalid URL:${arg0}`);
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("codemod.showCodemodSettings", () => {
      vscode.commands.executeCommand(
        "workbench.action.openSettings",
        "Codemod",
      );
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("codemod.clearOutputFiles", async () => {
      const { storageUri } = context;

      if (!storageUri) {
        console.error("No storage URI, aborting the command.");
        return;
      }

      await engineService.clearOutputFiles(storageUri);
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "codemod.executeAsCodemod",
      async (codemodUri: vscode.Uri) => {
        try {
          const targetUri = vscode.workspace.workspaceFolders?.[0]?.uri ?? null;

          if (targetUri == null) {
            throw new Error("No workspace has been opened.");
          }

          const { storageUri } = context;

          if (!storageUri) {
            throw new Error("No storage URI, aborting the command.");
          }

          const happenedAt = String(Date.now());

          const fileStat = await vscode.workspace.fs.stat(targetUri);
          const targetUriIsDirectory = Boolean(
            fileStat.type & vscode.FileType.Directory,
          );

          messageBus.publish({
            kind: MessageKind.executeCodemodSet,
            command: {
              kind: "executeLocalCodemod",
              codemodUri,
              name: codemodUri.fsPath,
              codemodHash: null,
            },
            happenedAt,
            caseHashDigest: buildCaseHash(),
            storageUri,
            targetUri,
            targetUriIsDirectory,
          });
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          vscode.window.showErrorMessage(message);

          vscodeTelemetry.sendError({
            kind: "failedToExecuteCommand",
            commandName: "codemod.executeAsCodemod",
          });
        }
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "codemod.executeCodemod",
      async (targetUri: vscode.Uri, codemodHash: CodemodHash) => {
        try {
          const { storageUri } = context;

          if (!storageUri) {
            throw new Error("No storage URI, aborting the command.");
          }

          const happenedAt = String(Date.now());

          const fileStat = await vscode.workspace.fs.stat(targetUri);
          const targetUriIsDirectory = Boolean(
            fileStat.type & vscode.FileType.Directory,
          );

          const codemod =
            store.getState().codemod.entities[codemodHash] ?? null;

          if (codemod === null) {
            throw new Error(
              "No codemod was found with the provided hash digest.",
            );
          }

          const args = selectCodemodArguments(
            store.getState(),
            codemodHash as unknown as CodemodNodeHashDigest,
          );
          const command: Command = {
            kind: "executeCodemod",
            codemodHash,
            name: codemod.name,
            arguments: args,
          };

          store.dispatch(
            actions.setFocusedCodemodHashDigest(
              codemodHash as unknown as CodemodNodeHashDigest,
            ),
          );

          messageBus.publish({
            kind: MessageKind.executeCodemodSet,
            command,
            caseHashDigest: buildCaseHash(),
            happenedAt,
            targetUri,
            targetUriIsDirectory,
            storageUri,
          });

          vscode.commands.executeCommand(
            "workbench.view.extension.codemodViewId",
          );
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          vscode.window.showErrorMessage(message);

          vscodeTelemetry.sendError({
            kind: "failedToExecuteCommand",
            commandName: "codemod.executeCodemod",
          });
        }
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "codemod.clearState",
      createClearStateCommand({ fileService, store }),
    ),
  );

  context.subscriptions.push(
    vscode.window.registerUriHandler({
      handleUri: async (uri) => {
        const urlParams = new URLSearchParams(uri.query);

        const codemodHashDigest = urlParams.get(
          SEARCH_PARAMS_KEYS.CODEMOD_HASH_DIGEST,
        );
        const state = store.getState();
        if (!codemodHashDigest) {
          return;
        }

        vscode.commands.executeCommand(
          "workbench.view.extension.codemodViewId",
        );

        // user is opening a deep link to a specific codemod

        // Expand collapsed parent directories of the relevant codemod

        const codemod = state.codemod.entities[codemodHashDigest] ?? null;
        if (codemod === null) {
          return;
        }
        const { name } = codemod;
        const sep = name.indexOf("/") !== -1 ? "/" : ":";

        const pathParts = name.split(sep).filter((part) => part !== "");

        if (pathParts.length === 0) {
          return;
        }

        pathParts.forEach((name, idx) => {
          const path = pathParts.slice(0, idx + 1).join(sep);

          if (idx === pathParts.length - 1) {
            return;
          }

          const parentHashDigest = buildHash(
            [path, name].join("_"),
          ) as CodemodNodeHashDigest;

          if (
            state.codemodDiscoveryView.expandedNodeHashDigests.includes(
              parentHashDigest,
            )
          ) {
            return;
          }

          store.dispatch(actions.flipCodemodHashDigest(parentHashDigest));
        });

        if (state.codemodDiscoveryView.searchPhrase.length > 0) {
          store.dispatch(actions.setCodemodSearchPhrase(""));
        }

        store.dispatch(
          actions.setFocusedCodemodHashDigest(
            codemodHashDigest as unknown as CodemodNodeHashDigest,
          ),
        );
      },
    }),
  );

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "codemodErrorViewId",
      errorWebviewProvider,
    ),
  );

  messageBus.publish({
    kind: MessageKind.bootstrapEngine,
  });
}
