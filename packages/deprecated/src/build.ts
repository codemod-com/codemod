// export const rebuildCodemodFallback = async (options: {
//   globPattern: string | string[];
//   source: string;
//   errorText: string;
//   onSuccess?: () => void;
//   onFail?: () => void;
// }): Promise<string> => {
//   const { globPattern, source, errorText, onSuccess, onFail } = options;

//   const locateMainFile = async () => {
//     const mainFiles = await glob(globPattern, {
//       absolute: true,
//       ignore: ["**/node_modules/**"],
//       cwd: source,
//       nodir: true,
//     });

//     return mainFiles.at(0);
//   };

//   let mainFilePath = await locateMainFile();

//   try {
//     // Try to build the codemod anyways, and if after build there is still no main file
//     // or the process throws - throw an error
//     await execPromise("codemod build", { cwd: source });

//     mainFilePath = await locateMainFile();
//     // Likely meaning that the "codemod build" command succeeded, but the file was still not found in output
//     if (mainFilePath === undefined) {
//       throw new Error();
//     }
//     onSuccess?.();
//   } catch (error) {
//     onFail?.();
//     throw new Error(errorText);
//   }

//   return mainFilePath;
// };
