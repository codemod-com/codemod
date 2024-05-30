import { createHash } from "node:crypto";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  PIRANHA_LANGUAGES,
  piranhaLanguageSchema,
} from "@codemod-com/utilities";

import { isLeft } from "fp-ts/lib/Either";
import prettyReporter from "io-ts-reporters";
import { parse } from "valibot";
import * as vscode from "vscode";
import { CaseManager } from "./cases/caseManager";
import { type CaseHash, caseHashCodec } from "./cases/types";
import { createClearStateCommand } from "./commands/clearStateCommand";
import { BootstrapExecutablesService } from "./components/bootstrapExecutablesService";
import { DownloadService } from "./components/downloadService";
import { EngineService } from "./components/engineService";
import { FileService } from "./components/fileService";
import { FileSystemUtilities } from "./components/fileSystemUtilities";
import { JobManager } from "./components/jobManager";
import { type Command, MessageBus, MessageKind } from "./components/messageBus";
import { CustomTextDocumentContentProvider } from "./components/textDocumentContentProvider";
import { CustomPanelProvider } from "./components/webview/CustomPanelProvider";
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
import { selectExplorerTree } from "./selectors/selectExplorerTree";
import { generateDistinctId, getDistinctId } from "./telemetry/distinctId";
import { buildCaseHash } from "./telemetry/hashes";
import { buildTelemetryLogger } from "./telemetry/logger";
import { VscodeTelemetryReporter } from "./telemetry/reporter";
import { buildHash, isNeitherNullNorUndefined } from "./utilities";

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

  const jobManager = new JobManager(fileService, messageBus, store);

  new CaseManager(messageBus, store);

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

  const customTextDocumentContentProvider =
    new CustomTextDocumentContentProvider();

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

  new CustomPanelProvider(
    context.extensionUri,
    store,
    mainViewProvider,
    messageBus,
    rootUri?.fsPath ?? null,
    jobManager,
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
      "codemod.sourceControl.saveStagedJobsToTheFileSystem",
      async (arg0: unknown) => {
        try {
          store.dispatch(actions.setApplySelectedInProgress(true));

          const validation = caseHashCodec.decode(arg0);

          if (validation._tag === "Left") {
            throw new Error(prettyReporter.report(validation).join("\n"));
          }

          const caseHashDigest = validation.right;

          const state = store.getState();

          if (caseHashDigest !== state.codemodRunsTab.selectedCaseHash) {
            return;
          }

          const tree = selectExplorerTree(
            state,
            vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? "",
          );

          if (tree === null) {
            store.dispatch(actions.setApplySelectedInProgress(false));
            return;
          }

          const { selectedJobHashes } = tree;

          await jobManager.acceptJobs(new Set(selectedJobHashes));

          store.dispatch(actions.clearSelectedExplorerNodes(caseHashDigest));
          store.dispatch(
            actions.clearIndeterminateExplorerNodes(caseHashDigest),
          );

          vscode.commands.executeCommand("workbench.view.scm");
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          vscodeTelemetry.sendError({
            kind: "failedToExecuteCommand",
            commandName: "codemod.sourceControl.saveStagedJobsToTheFileSystem",
          });
          vscode.window.showErrorMessage(message);
        } finally {
          store.dispatch(actions.setApplySelectedInProgress(false));
        }
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("codemod.discardJobs", async (arg0) => {
      try {
        const validation = caseHashCodec.decode(arg0);

        if (validation._tag === "Left") {
          throw new Error(prettyReporter.report(validation).join("\n"));
        }

        const caseHashDigest = validation.right;

        const state = store.getState();

        if (caseHashDigest !== state.codemodRunsTab.selectedCaseHash) {
          return;
        }

        const tree = selectExplorerTree(
          state,
          vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? "",
        );

        if (tree === null) {
          return;
        }

        const { selectedJobHashes } = tree;

        jobManager.deleteJobs(selectedJobHashes);

        store.dispatch(actions.clearSelectedExplorerNodes(caseHashDigest));
        store.dispatch(actions.clearIndeterminateExplorerNodes(caseHashDigest));
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        vscode.window.showErrorMessage(message);

        vscodeTelemetry.sendError({
          kind: "failedToExecuteCommand",
          commandName: "codemod.discardJobs",
        });
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("codemod.rejectCase", async (arg0) => {
      try {
        const caseHash: string | null = typeof arg0 === "string" ? arg0 : null;

        if (caseHash === null) {
          throw new Error("Did not pass the caseHash into the command.");
        }

        messageBus.publish({
          kind: MessageKind.rejectCase,
          caseHash: caseHash as CaseHash,
        });
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        vscode.window.showErrorMessage(message);

        vscodeTelemetry.sendError({
          kind: "failedToExecuteCommand",
          commandName: "codemod.rejectCase",
        });
      }
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
      "codemod.executeAsPiranhaRule",
      async (configurationUri: vscode.Uri) => {
        const fileStat = await vscode.workspace.fs.stat(configurationUri);
        const configurationUriIsDirectory = Boolean(
          fileStat.type & vscode.FileType.Directory,
        );

        if (!configurationUriIsDirectory) {
          throw new Error(
            "To execute a configuration URI as a Piranha rule, it has to be a directory",
          );
        }

        const targetUri = vscode.workspace.workspaceFolders?.[0]?.uri ?? null;

        if (targetUri == null) {
          throw new Error("No workspace has been opened.");
        }

        const { storageUri } = context;

        if (!storageUri) {
          throw new Error("No storage URI, aborting the command.");
        }

        const quickPick =
          (await vscode.window.showQuickPick(PIRANHA_LANGUAGES, {
            title: "Select the language to run Piranha against",
          })) ?? null;

        if (quickPick == null) {
          throw new Error("You must specify the language");
        }

        const language = parse(piranhaLanguageSchema, quickPick);

        messageBus.publish({
          kind: MessageKind.executeCodemodSet,
          command: {
            kind: "executePiranhaRule",
            configurationUri,
            language,
            name: configurationUri.fsPath,
          },
          happenedAt: String(Date.now()),
          caseHashDigest: buildCaseHash(),
          storageUri,
          targetUri,
          targetUriIsDirectory: configurationUriIsDirectory,
        });
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
          const command: Command =
            // @ts-ignore TODO: Remove this logic in the next PR
            codemod.kind === "piranhaRule"
              ? {
                  kind: "executePiranhaRule",
                  configurationUri: vscode.Uri.file(
                    join(
                      homedir(),
                      ".codemod",
                      createHash("ripemd160")
                        .update(codemod.name)
                        .digest("base64url"),
                    ),
                  ),
                  // @ts-ignore TODO: Remove this logic in the next PR
                  language: codemod.language,
                  name: codemod.name,
                  arguments: args,
                }
              : {
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
      "codemod.executeCodemodWithinPath",
      async (uriArg: vscode.Uri | null | undefined) => {
        try {
          const { storageUri } = context;

          if (!storageUri) {
            throw new Error("No storage URI, aborting the command.");
          }

          const targetUri =
            uriArg ?? vscode.window.activeTextEditor?.document.uri ?? null;

          if (targetUri === null) {
            return;
          }

          const codemodList = Object.values(
            store.getState().codemod.entities,
          ).filter(isNeitherNullNorUndefined);

          // order: least recent to most recent
          const top5RecentCodemodHashes =
            store.getState().lastCodemodHashDigests;

          const top5RecentCodemods = codemodList.filter((codemod) =>
            top5RecentCodemodHashes.includes(codemod.hashDigest as CodemodHash),
          );

          // order: least recent to most recent
          top5RecentCodemods.sort((a, b) => {
            return (
              top5RecentCodemodHashes.indexOf(a.hashDigest as CodemodHash) -
              top5RecentCodemodHashes.indexOf(b.hashDigest as CodemodHash)
            );
          });
          const sortedCodemodList = [
            ...top5RecentCodemods.reverse(),
            ...codemodList.filter(
              (codemod) =>
                !top5RecentCodemodHashes.includes(
                  codemod.hashDigest as CodemodHash,
                ),
            ),
          ];

          const quickPickItem =
            (await vscode.window.showQuickPick(
              sortedCodemodList.map(({ name, hashDigest }) => ({
                label: name,
                ...(top5RecentCodemodHashes.includes(
                  hashDigest as CodemodHash,
                ) && { description: "(recent)" }),
              })),
              {
                placeHolder: "Pick a codemod to execute over the selected path",
              },
            )) ?? null;

          if (quickPickItem === null) {
            return;
          }

          const codemodEntry =
            sortedCodemodList.find(
              ({ name }) => name === quickPickItem.label,
            ) ?? null;

          if (codemodEntry === null) {
            throw new Error("Codemod is not selected");
          }

          await mainViewProvider.updateExecutionPath({
            newPath: targetUri.path,
            codemodHash: codemodEntry.hashDigest as CodemodHash,
            fromVSCodeCommand: true,
            errorMessage: null,
            warningMessage: null,
            revertToPrevExecutionIfInvalid: false,
          });

          vscode.commands.executeCommand(
            "workbench.view.extension.codemodViewId",
          );

          store.dispatch(
            actions.setFocusedCodemodHashDigest(
              codemodEntry.hashDigest as unknown as CodemodNodeHashDigest,
            ),
          );

          const fileStat = await vscode.workspace.fs.stat(targetUri);
          const targetUriIsDirectory = Boolean(
            fileStat.type & vscode.FileType.Directory,
          );

          const args = selectCodemodArguments(
            store.getState(),
            codemodEntry.hashDigest as unknown as CodemodNodeHashDigest,
          );

          const command: Command =
            // @ts-ignore TODO: Remove this logic in the next PR
            codemodEntry.kind === "piranhaRule"
              ? {
                  kind: "executePiranhaRule",
                  configurationUri: vscode.Uri.file(
                    join(
                      homedir(),
                      ".codemod",
                      createHash("ripemd160")
                        .update(codemodEntry.name)
                        .digest("base64url"),
                    ),
                  ),
                  // @ts-ignore TODO: Remove this logic in the next PR
                  language: codemodEntry.language,
                  name: codemodEntry.name,
                  arguments: args,
                }
              : {
                  kind: "executeCodemod",
                  codemodHash: codemodEntry.hashDigest as CodemodHash,
                  name: codemodEntry.name,
                  arguments: args,
                };

          messageBus.publish({
            kind: MessageKind.executeCodemodSet,
            command,
            caseHashDigest: buildCaseHash(),
            happenedAt: String(Date.now()),
            storageUri,
            targetUri,
            targetUriIsDirectory,
          });
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          vscode.window.showErrorMessage(message);

          vscodeTelemetry.sendError({
            kind: "failedToExecuteCommand",
            commandName: "codemod.executeCodemodWithinPath",
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
    vscode.commands.registerCommand("codemod.stopStateClearing", () => {
      store.dispatch(actions.onStateCleared());
    }),
  );

  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider(
      "codemod",
      customTextDocumentContentProvider,
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

        const [hash, casesString] = uri.toString().split("/").reverse();
        const codemodRunCaseHash =
          casesString === "cases" && hash ? hash : null;

        // user is routed to a specific dry run case
        if (codemodRunCaseHash !== null) {
          vscode.commands.executeCommand(
            "workbench.view.extension.codemodViewId",
          );

          const validation = caseHashCodec.decode(codemodRunCaseHash);
          if (isLeft(validation)) {
            throw new Error(prettyReporter.report(validation).join("\n"));
          }

          messageBus.publish({
            kind: MessageKind.loadHomeDirectoryCase,
            caseHashDigest: validation.right,
          });
        }

        // user is opening a deep link to a specific codemod
        else if (codemodHashDigest !== null) {
          vscode.commands.executeCommand(
            "workbench.view.extension.codemodViewId",
          );

          // Expand collapsed parent directories of the relevant codemod
          if (codemodHashDigest !== null) {
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
          }

          if (state.codemodDiscoveryView.searchPhrase.length > 0) {
            store.dispatch(actions.setCodemodSearchPhrase(""));
          }

          store.dispatch(
            actions.setFocusedCodemodHashDigest(
              codemodHashDigest as unknown as CodemodNodeHashDigest,
            ),
          );
        }
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

  messageBus.publish({
    kind: MessageKind.loadHomeDirectoryData,
  });
}
