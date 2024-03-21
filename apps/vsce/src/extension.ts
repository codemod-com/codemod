import { createHash, randomBytes } from "crypto";
import { existsSync, rmSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { CodemodConfig } from "@codemod-com/utilities";
import TelemetryReporter from "@vscode/extension-telemetry";
import { isLeft } from "fp-ts/lib/Either";
import { mkdir, readFile, writeFile } from "fs/promises";
import prettyReporter from "io-ts-reporters";
import * as vscode from "vscode";
import { CaseManager } from "./cases/caseManager";
import { CaseHash, caseHashCodec } from "./cases/types";
import { createClearStateCommand } from "./commands/clearStateCommand";
import { BootstrapExecutablesService } from "./components/bootstrapExecutablesService";
import { DownloadService } from "./components/downloadService";
import { EngineService } from "./components/engineService";
import { FileService } from "./components/fileService";
import { FileSystemUtilities } from "./components/fileSystemUtilities";
import { JobManager } from "./components/jobManager";
import { Command, MessageBus, MessageKind } from "./components/messageBus";
import { CustomTextDocumentContentProvider } from "./components/textDocumentContentProvider";
import { GlobalStateTokenStorage, UserService } from "./components/userService";
import { CodemodDescriptionProvider } from "./components/webview/CodemodDescriptionProvider";
import { CustomPanelProvider } from "./components/webview/CustomPanelProvider";
import { ErrorWebviewProvider } from "./components/webview/ErrorWebviewProvider";
import {
	MainViewProvider,
	createIssue,
	validateAccessToken,
} from "./components/webview/MainProvider";
import { getConfiguration } from "./configuration";
import { buildContainer } from "./container";
import { buildStore } from "./data";
import {
	PIRANHA_LANGUAGES,
	parsePiranhaLanguage,
} from "./data/codemodConfigSchema";
import { parsePrivateCodemodsEnvelope } from "./data/privateCodemodsEnvelopeSchema";
import { HomeDirectoryService } from "./data/readHomeDirectoryCases";
import { actions } from "./data/slice";
import { CodemodHash } from "./packageJsonAnalyzer/types";
import {
	CodemodNodeHashDigest,
	selectCodemodArguments,
} from "./selectors/selectCodemodTree";
import { selectExplorerTree } from "./selectors/selectExplorerTree";
import { buildCaseHash } from "./telemetry/hashes";
import { VscodeTelemetry } from "./telemetry/vscodeTelemetry";
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
	ACCESS_TOKEN = "accessToken",
}

const messageBus = new MessageBus();

export async function activate(context: vscode.ExtensionContext) {
	const rootUri = vscode.workspace.workspaceFolders?.[0]?.uri ?? null;

	messageBus.setDisposables(context.subscriptions);

	const { store } = await buildStore(context.workspaceState);

	const globalStateTokenStorage = new GlobalStateTokenStorage(
		context.globalState,
	);
	const userService = new UserService(globalStateTokenStorage);

	const accessToken = userService.getLinkedToken();
	if (accessToken !== null) {
		const valid = await validateAccessToken(accessToken);
		vscode.commands.executeCommand("setContext", "codemod.signedIn", valid);

		if (!valid) {
			userService.unlinkCodemodComUserAccount();
			const decision = await vscode.window.showInformationMessage(
				"You are signed out because your session has expired.",
				"Do you want to sign in again?",
			);
			if (decision === "Do you want to sign in again?") {
				const searchParams = new URLSearchParams();

				searchParams.set(
					SEARCH_PARAMS_KEYS.COMMAND,
					"accessTokenRequestedByVSCE",
				);

				const url = new URL("https://codemod.studio");
				url.search = searchParams.toString();

				vscode.commands.executeCommand("codemod.redirect", url);
			}
		}
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
	);

	const telemetryKey = "d9f8ad27-50df-46e3-8acf-81ea279c8444";
	const vscodeTelemetry = new VscodeTelemetry(
		new TelemetryReporter(telemetryKey),
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
		userService,
		engineService,
		messageBus,
		rootUri,
		store,
	);

	const mainView = vscode.window.registerWebviewViewProvider(
		"codemodMainView",
		mainViewProvider,
	);

	const codemodDescriptionProvider = new CodemodDescriptionProvider(
		vscode.workspace.fs,
	);

	new CustomPanelProvider(
		context.extensionUri,
		store,
		mainViewProvider,
		messageBus,
		codemodDescriptionProvider,
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
		vscode.commands.registerCommand("codemod.signIn", () => {
			const searchParams = new URLSearchParams();

			searchParams.set(
				SEARCH_PARAMS_KEYS.COMMAND,
				"accessTokenRequestedByVSCE",
			);

			const url = new URL("https://codemod.studio");
			url.search = searchParams.toString();

			vscode.commands.executeCommand("codemod.redirect", url);
		}),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("codemod.signOut", () => {
			userService.unlinkCodemodComUserAccount();
			vscode.commands.executeCommand("setContext", "codemod.signedIn", false);
			store.dispatch(
				actions.setToaster({
					toastId: "signOut",
					containerId: "primarySidebarToastContainer",
					content: "Signed out",
					autoClose: 3000,
				}),
			);
		}),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("codemod.handleSignedInUser", () => {
			store.dispatch(
				actions.setToaster({
					toastId: "handleSignedInUser",
					containerId: "primarySidebarToastContainer",
					content: "Already signed-in",
					autoClose: 5000,
				}),
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

				const language = parsePiranhaLanguage(quickPick);

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
			"codemod.executePrivateCodemod",
			async (
				targetUri: vscode.Uri,
				codemodHash: CodemodHash,
				codemodName: string,
			) => {
				try {
					const { storageUri } = context;

					if (!storageUri) {
						throw new Error("No storage URI, aborting the command.");
					}

					const fileStat = await vscode.workspace.fs.stat(targetUri);
					const targetUriIsDirectory = Boolean(
						fileStat.type & vscode.FileType.Directory,
					);

					store.dispatch(
						actions.setFocusedCodemodHashDigest(
							codemodHash as unknown as CodemodNodeHashDigest,
						),
					);

					const codemodUri = vscode.Uri.file(
						join(homedir(), ".codemod", codemodHash, "index.ts"),
					);

					messageBus.publish({
						kind: MessageKind.executeCodemodSet,
						command: {
							kind: "executeLocalCodemod",
							codemodUri,
							name: codemodName,
							codemodHash,
						},
						happenedAt: String(Date.now()),
						caseHashDigest: buildCaseHash(),
						storageUri,
						targetUri,
						targetUriIsDirectory,
					});

					vscode.commands.executeCommand(
						"workbench.view.extension.codemodViewId",
					);
				} catch (e) {
					const message = e instanceof Error ? e.message : String(e);
					vscode.window.showErrorMessage(message);

					vscodeTelemetry.sendError({
						kind: "failedToExecuteCommand",
						commandName: "codemod.executeImportedModOnPath",
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
		vscode.commands.registerCommand(
			"codemod.removePrivateCodemod",
			(arg0: unknown) => {
				try {
					const hashDigest: string | null =
						typeof arg0 === "string" ? arg0 : null;

					if (hashDigest === null) {
						throw new Error("Did not pass the hashDigest into the command.");
					}
					const codemodPath = join(homedir(), ".codemod", hashDigest);
					if (existsSync(codemodPath)) {
						rmSync(codemodPath, { recursive: true, force: true });
					}

					const codemodNamesPath = join(
						homedir(),
						".codemod",
						"privateCodemodNames.json",
					);
					if (existsSync(codemodNamesPath)) {
						rmSync(codemodNamesPath);
					}

					store.dispatch(
						actions.removePrivateCodemods([hashDigest as CodemodHash]),
					);
				} catch (e) {
					const message = e instanceof Error ? e.message : String(e);
					vscode.window.showErrorMessage(message);

					vscodeTelemetry.sendError({
						kind: "failedToExecuteCommand",
						commandName: "codemod.removePrivateCodemod",
					});
				}
			},
		),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("codemod.sendAsBeforeSnippet", async () => {
			const { activeTextEditor } = vscode.window;

			if (!activeTextEditor) {
				console.error(
					"No active text editor, sendAsBeforeSnippet will not be executed",
				);
				return;
			}

			const selection = activeTextEditor.selection;
			const text = activeTextEditor.document.getText(selection);

			const beforeSnippet = Buffer.from(text).toString("base64url");

			const uri = vscode.Uri.parse(
				`https://codemod.studio?beforeSnippet=${beforeSnippet}`,
			);

			await vscode.env.openExternal(uri);
		}),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("codemod.sendAsAfterSnippet", async () => {
			const { activeTextEditor } = vscode.window;

			if (!activeTextEditor) {
				console.error(
					"No active text editor, sendAsAfterSnippet will not be executed",
				);
				return;
			}

			const selection = activeTextEditor.selection;
			const text = activeTextEditor.document.getText(selection);

			const afterSnippet = Buffer.from(text).toString("base64url");

			const uri = vscode.Uri.parse(
				`https://codemod.studio?afterSnippet=${afterSnippet}`,
			);

			await vscode.env.openExternal(uri);
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
				const codemodSource = urlParams.get(SEARCH_PARAMS_KEYS.CODEMOD_SOURCE);

				const codemodHashDigest = urlParams.get(
					SEARCH_PARAMS_KEYS.CODEMOD_HASH_DIGEST,
				);
				const accessToken = urlParams.get(SEARCH_PARAMS_KEYS.ACCESS_TOKEN);
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

				// user is exporting codemod from studio into extension
				if (codemodSource !== null) {
					vscode.commands.executeCommand(
						"workbench.view.extension.codemodViewId",
					);
					const codemodSourceBuffer = Buffer.from(codemodSource, "base64url");

					const globalStoragePath = join(homedir(), ".codemod");
					const codemodHash = randomBytes(27).toString("base64url");
					const codemodDirectoryPath = join(globalStoragePath, codemodHash);
					await mkdir(codemodDirectoryPath, { recursive: true });

					const buildConfigPath = join(codemodDirectoryPath, ".codemodrc.json");

					await writeFile(
						buildConfigPath,
						JSON.stringify({
							version: "1.0.0",
							private: false,
							name: codemodHash,
							engine: "jscodeshift", // only jscodeshift codemod can be exported to VSCode from Studio at the moment
							meta: {},
						} satisfies CodemodConfig),
					);

					const buildIndexPath = join(codemodDirectoryPath, "index.ts");

					await writeFile(buildIndexPath, codemodSourceBuffer);

					const newPrivateCodemodNames = [];
					const privateCodemodNamesPath = join(
						globalStoragePath,
						"privateCodemodNames.json",
					);
					if (existsSync(privateCodemodNamesPath)) {
						const privateCodemodNamesJSON = await readFile(
							privateCodemodNamesPath,
							{
								encoding: "utf8",
							},
						);
						const privateCodemodNames = JSON.parse(privateCodemodNamesJSON);

						const { names } = parsePrivateCodemodsEnvelope(privateCodemodNames);

						newPrivateCodemodNames.push(...names);
					}
					newPrivateCodemodNames.push(codemodHash);
					await Promise.all([
						writeFile(
							privateCodemodNamesPath,
							JSON.stringify({
								names: newPrivateCodemodNames,
							}),
						),
						writeFile(
							join(codemodDirectoryPath, "urlParams.json"),
							JSON.stringify({
								urlParams: uri.query,
							}),
						),
					]);

					await engineService.fetchPrivateCodemods();

					store.dispatch(
						actions.setFocusedCodemodHashDigest(
							codemodHash as unknown as CodemodNodeHashDigest,
						),
					);
				}
				// user is opening a deep link to a specific codemod
				else if (codemodHashDigest !== null) {
					vscode.commands.executeCommand(
						"workbench.view.extension.codemodViewId",
					);

					// Expand collapsed parent directories of the relevant codemod
					if (codemodHashDigest !== null) {
						const privateCodemod =
							state.privateCodemods.entities[codemodHashDigest] ?? null;

						if (privateCodemod !== null) {
							store.dispatch(
								actions.setFocusedCodemodHashDigest(
									codemodHashDigest as unknown as CodemodNodeHashDigest,
								),
							);
							return;
						}

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
				} else if (accessToken !== null) {
					const routeUserToStudioToAuthenticate = async () => {
						const result = await vscode.window.showErrorMessage(
							"Invalid access token. Try signing in again.",
							{ modal: true },
							"Sign in with Github",
						);

						if (result !== "Sign in with Github") {
							return;
						}

						const searchParams = new URLSearchParams();

						searchParams.set(
							SEARCH_PARAMS_KEYS.COMMAND,
							"accessTokenRequestedByVSCE",
						);

						const url = new URL("https://codemod.studio");
						url.search = searchParams.toString();

						vscode.commands.executeCommand("codemod.redirect", url);
					};

					vscode.commands.executeCommand(
						"workbench.view.extension.codemodViewId",
					);

					const valid = await validateAccessToken(accessToken);
					if (valid) {
						userService.linkCodemodComUserAccount(accessToken);
						vscode.commands.executeCommand(
							"setContext",
							"codemod.signedIn",
							true,
						);
						store.dispatch(
							actions.setToaster({
								toastId: "signIn",
								containerId: "primarySidebarToastContainer",
								content: "Successfully signed in",
								autoClose: 3000,
							}),
						);
					} else {
						await routeUserToStudioToAuthenticate();
						return;
					}

					const sourceControlState = state.sourceControl;

					if (sourceControlState.kind !== "ISSUE_CREATION_WAITING_FOR_AUTH") {
						return;
					}

					const onSuccess = () => {
						store.dispatch(
							actions.setSourceControlTabProps({
								kind: "IDLENESS",
							}),
						);
						store.dispatch(actions.setActiveTabId("codemodRuns"));
					};

					const onFail = async () => {
						userService.unlinkCodemodComUserAccount();
						store.dispatch(
							actions.setSourceControlTabProps({
								kind: "ISSUE_CREATION_WAITING_FOR_AUTH",
								title: sourceControlState.title,
								body: sourceControlState.body,
							}),
						);
						await routeUserToStudioToAuthenticate();
					};

					store.dispatch(
						actions.setSourceControlTabProps({
							kind: "WAITING_FOR_ISSUE_CREATION_API_RESPONSE",
							title: sourceControlState.title,
							body: sourceControlState.body,
						}),
					);

					await createIssue(
						sourceControlState.title,
						sourceControlState.body,
						accessToken,
						onSuccess,
						onFail,
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

	new HomeDirectoryService(messageBus, store, rootUri);

	messageBus.publish({
		kind: MessageKind.loadHomeDirectoryData,
	});
}
