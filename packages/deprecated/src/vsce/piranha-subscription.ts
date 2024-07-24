// context.subscriptions.push(
//   vscode.commands.registerCommand(
//     "codemod.executeAsPiranhaRule",
//     async (configurationUri: vscode.Uri) => {
//       const fileStat = await vscode.workspace.fs.stat(configurationUri);
//       const configurationUriIsDirectory = Boolean(
//         fileStat.type & vscode.FileType.Directory,
//       );

//       if (!configurationUriIsDirectory) {
//         throw new Error(
//           "To execute a configuration URI as a Piranha rule, it has to be a directory",
//         );
//       }

//       const targetUri = vscode.workspace.workspaceFolders?.[0]?.uri ?? null;

//       if (targetUri == null) {
//         throw new Error("No workspace has been opened.");
//       }

//       const { storageUri } = context;

//       if (!storageUri) {
//         throw new Error("No storage URI, aborting the command.");
//       }

//       const quickPick =
//         (await vscode.window.showQuickPick(PIRANHA_LANGUAGES, {
//           title: "Select the language to run Piranha against",
//         })) ?? null;

//       if (quickPick == null) {
//         throw new Error("You must specify the language");
//       }

//       const language = parse(piranhaLanguageSchema, quickPick);

//       messageBus.publish({
//         kind: MessageKind.executeCodemodSet,
//         command: {
//           kind: "executePiranhaRule",
//           configurationUri,
//           language,
//           name: configurationUri.fsPath,
//         },
//         happenedAt: String(Date.now()),
//         caseHashDigest: buildCaseHash(),
//         storageUri,
//         targetUri,
//         targetUriIsDirectory: configurationUriIsDirectory,
//       });
//     },
//   ),
// );
