import * as vscode from "vscode";

export const getConfiguration = () => {
  const configuration = vscode.workspace.getConfiguration("codemod");

  const workerThreadCount = configuration.get<number>("workerThreadCount") ?? 4;

  const includePatterns = configuration.get<string[]>("include") ?? [
    "**/*.*{ts,tsx,js,jsx,mjs,cjs,mdx,json}",
  ];
  const excludePatterns = configuration.get<string[]>("exclude") ?? [
    "**/node_modules/**/*.*",
  ];

  const formatWithPrettier =
    configuration.get<boolean>("formatWithPrettier") ?? false;

  return {
    workerThreadCount,
    includePatterns,
    excludePatterns,
    formatWithPrettier,
  };
};

export const setConfigurationProperty = async (
  propertyName: string,
  value: unknown,
  configurationTarget: vscode.ConfigurationTarget,
) => {
  const configuration = vscode.workspace.getConfiguration("codemod");

  return configuration.update(propertyName, value, configurationTarget);
};
export type Configuration = ReturnType<typeof getConfiguration>;
