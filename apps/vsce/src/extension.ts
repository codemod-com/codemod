import { createHash } from 'node:crypto';
import { homedir } from 'node:os';
import { join } from 'node:path';
import {
	CODEMOD_STUDIO_URL,
	PIRANHA_LANGUAGES,
	piranhaLanguageSchema,
} from '@codemod-com/utilities';

import { isLeft } from 'fp-ts/lib/Either';
import prettyReporter from 'io-ts-reporters';
import { parse } from 'valibot';
import * as vscode from 'vscode';
import { CaseManager } from './cases/caseManager';
import { type CaseHash, caseHashCodec } from './cases/types';
import { createClearStateCommand } from './commands/clearStateCommand';
import { BootstrapExecutablesService } from './components/bootstrapExecutablesService';
import { DownloadService } from './components/downloadService';
import { EngineService } from './components/engineService';
import { FileService } from './components/fileService';
import { FileSystemUtilities } from './components/fileSystemUtilities';
import { JobManager } from './components/jobManager';
import { type Command, MessageBus, MessageKind } from './components/messageBus';
import { CustomTextDocumentContentProvider } from './components/textDocumentContentProvider';
import { GlobalStateTokenStorage, UserService } from './components/userService';
import { CustomPanelProvider } from './components/webview/CustomPanelProvider';
import { ErrorWebviewProvider } from './components/webview/ErrorWebviewProvider';
import {
	MainViewProvider,
	createIssue,
	validateAccessToken,
} from './components/webview/MainProvider';
import { getConfiguration } from './configuration';
import { buildContainer } from './container';
import { buildStore } from './data';
import { HomeDirectoryService } from './data/readHomeDirectoryCases';
import { actions } from './data/slice';
import type { CodemodHash } from './packageJsonAnalyzer/types';
import type { CodemodNodeHashDigest } from './selectors/selectCodemodTree';
import { selectExplorerTree } from './selectors/selectExplorerTree';
import { generateDistinctId, getDistinctId } from './telemetry/distinctId';
import { buildCaseHash } from './telemetry/hashes';
import { buildTelemetryLogger } from './telemetry/logger';
import { VscodeTelemetryReporter } from './telemetry/reporter';
import { buildHash, isNeitherNullNorUndefined } from './utilities';

export enum SEARCH_PARAMS_KEYS {
	ENGINE = 'engine',
	BEFORE_SNIPPET = 'beforeSnippet',
	AFTER_SNIPPET = 'afterSnippet',
	CODEMOD_SOURCE = 'codemodSource',
	CODEMOD_NAME = 'codemodName',
	COMMAND = 'command',
	COMPRESSED_SHAREABLE_CODEMOD = 'c',
	CODEMOD_HASH_DIGEST = 'chd',
	ACCESS_TOKEN = 'accessToken',
}

let messageBus = new MessageBus();

export async function activate(context: vscode.ExtensionContext) {
	let rootUri = vscode.workspace.workspaceFolders?.[0]?.uri ?? null;

	messageBus.setDisposables(context.subscriptions);

	let { store } = await buildStore(context.workspaceState);

	let globalStateTokenStorage = new GlobalStateTokenStorage(
		context.globalState,
	);
	let userService = new UserService(globalStateTokenStorage);

	let accessToken = userService.getLinkedToken();
	let distinctId = await getDistinctId(context);

	if (distinctId === null) {
		distinctId = await generateDistinctId(context);
	}

	if (accessToken !== null) {
		let userData = await validateAccessToken(accessToken);

		let signedIn = userData !== null;

		vscode.commands.executeCommand(
			'setContext',
			'codemod.signedIn',
			signedIn,
		);

		if (!signedIn) {
			userService.unlinkCodemodComUserAccount();
			let decision = await vscode.window.showInformationMessage(
				'You are signed out because your session has expired.',
				'Do you want to sign in again?',
			);
			if (decision === 'Do you want to sign in again?') {
				let searchParams = new URLSearchParams();

				searchParams.set(
					SEARCH_PARAMS_KEYS.COMMAND,
					'accessTokenRequestedByVSCE',
				);

				let url = new URL(CODEMOD_STUDIO_URL);
				url.search = searchParams.toString();

				vscode.commands.executeCommand('codemod.redirect', url);
			}
		}

		distinctId = userData?.userId ?? 'AnonymousUser';
	}

	let configurationContainer = buildContainer(getConfiguration());

	context.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration(() => {
			configurationContainer.set(getConfiguration());
		}),
	);

	let fileService = new FileService(messageBus);

	let jobManager = new JobManager(fileService, messageBus, store);

	new CaseManager(messageBus, store);

	let fileSystemUtilities = new FileSystemUtilities(vscode.workspace.fs);

	let downloadService = new DownloadService(
		vscode.workspace.fs,
		fileSystemUtilities,
	);

	let engineService = new EngineService(
		configurationContainer,
		messageBus,
		vscode.workspace.fs,
		store,
	);

	let vscodeTelemetry = new VscodeTelemetryReporter(
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

	let customTextDocumentContentProvider =
		new CustomTextDocumentContentProvider();

	let mainViewProvider = new MainViewProvider(
		context,
		userService,
		engineService,
		messageBus,
		rootUri,
		store,
	);

	let mainView = vscode.window.registerWebviewViewProvider(
		'codemodMainView',
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

	let errorWebviewProvider = new ErrorWebviewProvider(
		context,
		messageBus,
		store,
		mainViewProvider,
	);

	// this is only used by the codemod panel's webview
	context.subscriptions.push(
		vscode.commands.registerCommand('codemod.redirect', (arg0) => {
			try {
				vscode.env.openExternal(vscode.Uri.parse(arg0));
			} catch (e) {
				vscode.window.showWarningMessage(`Invalid URL:${arg0}`);
			}
		}),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('codemod.showCodemodSettings', () => {
			vscode.commands.executeCommand(
				'workbench.action.openSettings',
				'Codemod',
			);
		}),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('codemod.signIn', () => {
			let searchParams = new URLSearchParams();

			searchParams.set(
				SEARCH_PARAMS_KEYS.COMMAND,
				'accessTokenRequestedByVSCE',
			);

			let url = new URL(CODEMOD_STUDIO_URL);
			url.search = searchParams.toString();

			vscode.commands.executeCommand('codemod.redirect', url);
		}),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('codemod.signOut', () => {
			userService.unlinkCodemodComUserAccount();
			vscode.commands.executeCommand(
				'setContext',
				'codemod.signedIn',
				false,
			);
			store.dispatch(
				actions.setToaster({
					toastId: 'signOut',
					containerId: 'primarySidebarToastContainer',
					content: 'Signed out',
					autoClose: 3000,
				}),
			);
		}),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('codemod.handleSignedInUser', () => {
			store.dispatch(
				actions.setToaster({
					toastId: 'handleSignedInUser',
					containerId: 'primarySidebarToastContainer',
					content: 'Already signed-in',
					autoClose: 5000,
				}),
			);
		}),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			'codemod.clearOutputFiles',
			async () => {
				let { storageUri } = context;

				if (!storageUri) {
					console.error('No storage URI, aborting the command.');
					return;
				}

				await engineService.clearOutputFiles(storageUri);
			},
		),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			'codemod.sourceControl.saveStagedJobsToTheFileSystem',
			async (arg0: unknown) => {
				try {
					store.dispatch(actions.setApplySelectedInProgress(true));

					let validation = caseHashCodec.decode(arg0);

					if (validation._tag === 'Left') {
						throw new Error(
							prettyReporter.report(validation).join('\n'),
						);
					}

					let caseHashDigest = validation.right;

					let state = store.getState();

					if (
						caseHashDigest !== state.codemodRunsTab.selectedCaseHash
					) {
						return;
					}

					let tree = selectExplorerTree(
						state,
						vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ??
							'',
					);

					if (tree === null) {
						store.dispatch(
							actions.setApplySelectedInProgress(false),
						);
						return;
					}

					let { selectedJobHashes } = tree;

					await jobManager.acceptJobs(new Set(selectedJobHashes));

					store.dispatch(
						actions.clearSelectedExplorerNodes(caseHashDigest),
					);
					store.dispatch(
						actions.clearIndeterminateExplorerNodes(caseHashDigest),
					);

					vscode.commands.executeCommand('workbench.view.scm');
				} catch (e) {
					let message = e instanceof Error ? e.message : String(e);
					vscodeTelemetry.sendError({
						kind: 'failedToExecuteCommand',
						commandName:
							'codemod.sourceControl.saveStagedJobsToTheFileSystem',
					});
					vscode.window.showErrorMessage(message);
				} finally {
					store.dispatch(actions.setApplySelectedInProgress(false));
				}
			},
		),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('codemod.discardJobs', async (arg0) => {
			try {
				let validation = caseHashCodec.decode(arg0);

				if (validation._tag === 'Left') {
					throw new Error(
						prettyReporter.report(validation).join('\n'),
					);
				}

				let caseHashDigest = validation.right;

				let state = store.getState();

				if (caseHashDigest !== state.codemodRunsTab.selectedCaseHash) {
					return;
				}

				let tree = selectExplorerTree(
					state,
					vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? '',
				);

				if (tree === null) {
					return;
				}

				let { selectedJobHashes } = tree;

				jobManager.deleteJobs(selectedJobHashes);

				store.dispatch(
					actions.clearSelectedExplorerNodes(caseHashDigest),
				);
				store.dispatch(
					actions.clearIndeterminateExplorerNodes(caseHashDigest),
				);
			} catch (e) {
				let message = e instanceof Error ? e.message : String(e);
				vscode.window.showErrorMessage(message);

				vscodeTelemetry.sendError({
					kind: 'failedToExecuteCommand',
					commandName: 'codemod.discardJobs',
				});
			}
		}),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('codemod.rejectCase', async (arg0) => {
			try {
				let caseHash: string | null =
					typeof arg0 === 'string' ? arg0 : null;

				if (caseHash === null) {
					throw new Error(
						'Did not pass the caseHash into the command.',
					);
				}

				messageBus.publish({
					kind: MessageKind.rejectCase,
					caseHash: caseHash as CaseHash,
				});
			} catch (e) {
				let message = e instanceof Error ? e.message : String(e);
				vscode.window.showErrorMessage(message);

				vscodeTelemetry.sendError({
					kind: 'failedToExecuteCommand',
					commandName: 'codemod.rejectCase',
				});
			}
		}),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			'codemod.executeAsCodemod',
			async (codemodUri: vscode.Uri) => {
				try {
					let targetUri =
						vscode.workspace.workspaceFolders?.[0]?.uri ?? null;

					if (targetUri == null) {
						throw new Error('No workspace has been opened.');
					}

					let { storageUri } = context;

					if (!storageUri) {
						throw new Error(
							'No storage URI, aborting the command.',
						);
					}

					let happenedAt = String(Date.now());

					let fileStat = await vscode.workspace.fs.stat(targetUri);
					let targetUriIsDirectory = Boolean(
						fileStat.type & vscode.FileType.Directory,
					);

					messageBus.publish({
						kind: MessageKind.executeCodemodSet,
						command: {
							kind: 'executeLocalCodemod',
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
					let message = e instanceof Error ? e.message : String(e);
					vscode.window.showErrorMessage(message);

					vscodeTelemetry.sendError({
						kind: 'failedToExecuteCommand',
						commandName: 'codemod.executeAsCodemod',
					});
				}
			},
		),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			'codemod.executeAsPiranhaRule',
			async (configurationUri: vscode.Uri) => {
				let fileStat = await vscode.workspace.fs.stat(configurationUri);
				let configurationUriIsDirectory = Boolean(
					fileStat.type & vscode.FileType.Directory,
				);

				if (!configurationUriIsDirectory) {
					throw new Error(
						'To execute a configuration URI as a Piranha rule, it has to be a directory',
					);
				}

				let targetUri =
					vscode.workspace.workspaceFolders?.[0]?.uri ?? null;

				if (targetUri == null) {
					throw new Error('No workspace has been opened.');
				}

				let { storageUri } = context;

				if (!storageUri) {
					throw new Error('No storage URI, aborting the command.');
				}

				let quickPick =
					(await vscode.window.showQuickPick(PIRANHA_LANGUAGES, {
						title: 'Select the language to run Piranha against',
					})) ?? null;

				if (quickPick == null) {
					throw new Error('You must specify the language');
				}

				let language = parse(piranhaLanguageSchema, quickPick);

				messageBus.publish({
					kind: MessageKind.executeCodemodSet,
					command: {
						kind: 'executePiranhaRule',
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
			'codemod.executeCodemod',
			async (targetUri: vscode.Uri, codemodHash: CodemodHash) => {
				try {
					let { storageUri } = context;

					if (!storageUri) {
						throw new Error(
							'No storage URI, aborting the command.',
						);
					}

					let happenedAt = String(Date.now());

					let fileStat = await vscode.workspace.fs.stat(targetUri);
					let targetUriIsDirectory = Boolean(
						fileStat.type & vscode.FileType.Directory,
					);

					let codemod =
						store.getState().codemod.entities[codemodHash] ?? null;

					if (codemod === null) {
						throw new Error(
							'No codemod was found with the provided hash digest.',
						);
					}

					// TODO: support codemod arguments
					// const args = selectCodemodArguments(
					// 	store.getState(),
					// 	codemodHash as unknown as CodemodNodeHashDigest,
					// );
					let command: Command =
						// @ts-ignore TODO: Remove this logic in the next PR
						codemod.kind === 'piranhaRule'
							? {
									kind: 'executePiranhaRule',
									configurationUri: vscode.Uri.file(
										join(
											homedir(),
											'.codemod',
											createHash('ripemd160')
												.update(codemod.name)
												.digest('base64url'),
										),
									),
									// @ts-ignore TODO: Remove this logic in the next PR
									language: codemod.language,
									name: codemod.name,
									arguments: [],
								}
							: {
									kind: 'executeCodemod',
									codemodHash,
									name: codemod.name,
									arguments: [],
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
						'workbench.view.extension.codemodViewId',
					);
				} catch (e) {
					let message = e instanceof Error ? e.message : String(e);
					vscode.window.showErrorMessage(message);

					vscodeTelemetry.sendError({
						kind: 'failedToExecuteCommand',
						commandName: 'codemod.executeCodemod',
					});
				}
			},
		),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			'codemod.executeCodemodWithinPath',
			async (uriArg: vscode.Uri | null | undefined) => {
				try {
					let { storageUri } = context;

					if (!storageUri) {
						throw new Error(
							'No storage URI, aborting the command.',
						);
					}

					let targetUri =
						uriArg ??
						vscode.window.activeTextEditor?.document.uri ??
						null;

					if (targetUri === null) {
						return;
					}

					let codemodList = Object.values(
						store.getState().codemod.entities,
					).filter(isNeitherNullNorUndefined);

					// order: least recent to most recent
					let top5RecentCodemodHashes =
						store.getState().lastCodemodHashDigests;

					let top5RecentCodemods = codemodList.filter((codemod) =>
						top5RecentCodemodHashes.includes(
							codemod.hashDigest as CodemodHash,
						),
					);

					// order: least recent to most recent
					top5RecentCodemods.sort((a, b) => {
						return (
							top5RecentCodemodHashes.indexOf(
								a.hashDigest as CodemodHash,
							) -
							top5RecentCodemodHashes.indexOf(
								b.hashDigest as CodemodHash,
							)
						);
					});
					let sortedCodemodList = [
						...top5RecentCodemods.reverse(),
						...codemodList.filter(
							(codemod) =>
								!top5RecentCodemodHashes.includes(
									codemod.hashDigest as CodemodHash,
								),
						),
					];

					let quickPickItem =
						(await vscode.window.showQuickPick(
							sortedCodemodList.map(({ name, hashDigest }) => ({
								label: name,
								...(top5RecentCodemodHashes.includes(
									hashDigest as CodemodHash,
								) && { description: '(recent)' }),
							})),
							{
								placeHolder:
									'Pick a codemod to execute over the selected path',
							},
						)) ?? null;

					if (quickPickItem === null) {
						return;
					}

					let codemodEntry =
						sortedCodemodList.find(
							({ name }) => name === quickPickItem.label,
						) ?? null;

					if (codemodEntry === null) {
						throw new Error('Codemod is not selected');
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
						'workbench.view.extension.codemodViewId',
					);

					store.dispatch(
						actions.setFocusedCodemodHashDigest(
							codemodEntry.hashDigest as unknown as CodemodNodeHashDigest,
						),
					);

					let fileStat = await vscode.workspace.fs.stat(targetUri);
					let targetUriIsDirectory = Boolean(
						fileStat.type & vscode.FileType.Directory,
					);

					// TODO: support codemod arguments
					// const args = selectCodemodArguments(
					// 	store.getState(),
					// 	codemodEntry.hashDigest as unknown as CodemodNodeHashDigest,
					// );

					let command: Command =
						// @ts-ignore TODO: Remove this logic in the next PR
						codemodEntry.kind === 'piranhaRule'
							? {
									kind: 'executePiranhaRule',
									configurationUri: vscode.Uri.file(
										join(
											homedir(),
											'.codemod',
											createHash('ripemd160')
												.update(codemodEntry.name)
												.digest('base64url'),
										),
									),
									// @ts-ignore TODO: Remove this logic in the next PR
									language: codemodEntry.language,
									name: codemodEntry.name,
									arguments: [],
								}
							: {
									kind: 'executeCodemod',
									codemodHash:
										codemodEntry.hashDigest as CodemodHash,
									name: codemodEntry.name,
									arguments: [],
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
					let message = e instanceof Error ? e.message : String(e);
					vscode.window.showErrorMessage(message);

					vscodeTelemetry.sendError({
						kind: 'failedToExecuteCommand',
						commandName: 'codemod.executeCodemodWithinPath',
					});
				}
			},
		),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			'codemod.clearState',
			createClearStateCommand({ fileService, store }),
		),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('codemod.stopStateClearing', () => {
			store.dispatch(actions.onStateCleared());
		}),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			'codemod.sendAsBeforeSnippet',
			async () => {
				let { activeTextEditor } = vscode.window;

				if (!activeTextEditor) {
					console.error(
						'No active text editor, sendAsBeforeSnippet will not be executed',
					);
					return;
				}

				let selection = activeTextEditor.selection;
				let text = activeTextEditor.document.getText(selection);

				let beforeSnippet = Buffer.from(text).toString('base64url');

				let uri = vscode.Uri.parse(
					`${CODEMOD_STUDIO_URL}?beforeSnippet=${beforeSnippet}`,
				);

				await vscode.env.openExternal(uri);
			},
		),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			'codemod.sendAsAfterSnippet',
			async () => {
				let { activeTextEditor } = vscode.window;

				if (!activeTextEditor) {
					console.error(
						'No active text editor, sendAsAfterSnippet will not be executed',
					);
					return;
				}

				let selection = activeTextEditor.selection;
				let text = activeTextEditor.document.getText(selection);

				let afterSnippet = Buffer.from(text).toString('base64url');

				let uri = vscode.Uri.parse(
					`${CODEMOD_STUDIO_URL}?afterSnippet=${afterSnippet}`,
				);

				await vscode.env.openExternal(uri);
			},
		),
	);

	context.subscriptions.push(
		vscode.workspace.registerTextDocumentContentProvider(
			'codemod',
			customTextDocumentContentProvider,
		),
	);

	context.subscriptions.push(
		vscode.window.registerUriHandler({
			handleUri: async (uri) => {
				let urlParams = new URLSearchParams(uri.query);

				let codemodHashDigest = urlParams.get(
					SEARCH_PARAMS_KEYS.CODEMOD_HASH_DIGEST,
				);
				let accessToken = urlParams.get(
					SEARCH_PARAMS_KEYS.ACCESS_TOKEN,
				);
				let state = store.getState();

				let [hash, casesString] = uri.toString().split('/').reverse();
				let codemodRunCaseHash =
					casesString === 'cases' && hash ? hash : null;

				// user is routed to a specific dry run case
				if (codemodRunCaseHash !== null) {
					vscode.commands.executeCommand(
						'workbench.view.extension.codemodViewId',
					);

					let validation = caseHashCodec.decode(codemodRunCaseHash);
					if (isLeft(validation)) {
						throw new Error(
							prettyReporter.report(validation).join('\n'),
						);
					}

					messageBus.publish({
						kind: MessageKind.loadHomeDirectoryCase,
						caseHashDigest: validation.right,
					});
				}

				// user is opening a deep link to a specific codemod
				else if (codemodHashDigest !== null) {
					vscode.commands.executeCommand(
						'workbench.view.extension.codemodViewId',
					);

					// Expand collapsed parent directories of the relevant codemod
					if (codemodHashDigest !== null) {
						let codemod =
							state.codemod.entities[codemodHashDigest] ?? null;
						if (codemod === null) {
							return;
						}
						let { name } = codemod;
						let sep = name.indexOf('/') !== -1 ? '/' : ':';

						let pathParts = name
							.split(sep)
							.filter((part) => part !== '');

						if (pathParts.length === 0) {
							return;
						}

						pathParts.forEach((name, idx) => {
							let path = pathParts.slice(0, idx + 1).join(sep);

							if (idx === pathParts.length - 1) {
								return;
							}

							let parentHashDigest = buildHash(
								[path, name].join('_'),
							) as CodemodNodeHashDigest;

							if (
								state.codemodDiscoveryView.expandedNodeHashDigests.includes(
									parentHashDigest,
								)
							) {
								return;
							}

							store.dispatch(
								actions.flipCodemodHashDigest(parentHashDigest),
							);
						});
					}

					if (state.codemodDiscoveryView.searchPhrase.length > 0) {
						store.dispatch(actions.setCodemodSearchPhrase(''));
					}

					store.dispatch(
						actions.setFocusedCodemodHashDigest(
							codemodHashDigest as unknown as CodemodNodeHashDigest,
						),
					);
				} else if (accessToken !== null) {
					let routeUserToStudioToAuthenticate = async () => {
						let result = await vscode.window.showErrorMessage(
							'Invalid access token. Try signing in again.',
							{ modal: true },
							'Sign in with Github',
						);

						if (result !== 'Sign in with Github') {
							return;
						}

						let searchParams = new URLSearchParams();

						searchParams.set(
							SEARCH_PARAMS_KEYS.COMMAND,
							'accessTokenRequestedByVSCE',
						);

						let url = new URL(CODEMOD_STUDIO_URL);
						url.search = searchParams.toString();

						vscode.commands.executeCommand('codemod.redirect', url);
					};

					vscode.commands.executeCommand(
						'workbench.view.extension.codemodViewId',
					);

					let valid = await validateAccessToken(accessToken);
					if (valid) {
						userService.linkCodemodComUserAccount(accessToken);
						vscode.commands.executeCommand(
							'setContext',
							'codemod.signedIn',
							true,
						);
						store.dispatch(
							actions.setToaster({
								toastId: 'signIn',
								containerId: 'primarySidebarToastContainer',
								content: 'Successfully signed in',
								autoClose: 3000,
							}),
						);
					} else {
						await routeUserToStudioToAuthenticate();
						return;
					}

					let sourceControlState = state.sourceControl;

					if (
						sourceControlState.kind !==
						'ISSUE_CREATION_WAITING_FOR_AUTH'
					) {
						return;
					}

					let onSuccess = () => {
						store.dispatch(
							actions.setSourceControlTabProps({
								kind: 'IDLENESS',
							}),
						);
						store.dispatch(actions.setActiveTabId('codemodRuns'));
					};

					let onFail = async () => {
						userService.unlinkCodemodComUserAccount();
						store.dispatch(
							actions.setSourceControlTabProps({
								kind: 'ISSUE_CREATION_WAITING_FOR_AUTH',
								title: sourceControlState.title,
								body: sourceControlState.body,
							}),
						);
						await routeUserToStudioToAuthenticate();
					};

					store.dispatch(
						actions.setSourceControlTabProps({
							kind: 'WAITING_FOR_ISSUE_CREATION_API_RESPONSE',
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
			'codemodErrorViewId',
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
