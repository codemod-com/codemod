import type { RSU } from "./options.js";
import type { UnifiedFileSystem } from "./unifiedFileSystem.js";

export interface PathAPI {
  readonly getDirname: (path: string) => string;
  readonly getBasename: (path: string) => string;
  readonly joinPaths: (...paths: string[]) => string;
  readonly currentWorkingDirectory: string;
}

export interface DataAPI<D extends RSU> extends PathAPI {
  getDependencies: () => D;
}

export interface FileAPI<D extends RSU> extends PathAPI, DataAPI<D> {
  readonly isDirectory: (path: string) => boolean;
  readonly exists: (path: string) => boolean;
  readonly readFile: (filePath: string) => Promise<string>;
}

export interface DirectoryAPI<D extends RSU> extends FileAPI<D> {
  readonly readDirectory: (directoryPath: string) => Promise<readonly string[]>;
}

export interface API<D extends RSU> {
  unifiedFileSystem: UnifiedFileSystem;
  directoryAPI: DirectoryAPI<D>;
  fileAPI: FileAPI<D>;
  dataAPI: DataAPI<D>;
}

export const buildApi = <D extends RSU>(
  unifiedFileSystem: UnifiedFileSystem,
  getDependencies: DataAPI<D>["getDependencies"],
  pathAPI: PathAPI,
): API<D> => {
  const dataAPI: DataAPI<D> = {
    getDependencies,
    ...pathAPI,
  };

  const directoryAPI: DirectoryAPI<D> = {
    readDirectory: (path) => unifiedFileSystem.readDirectory(path),
    isDirectory: (path) => unifiedFileSystem.isDirectory(path),
    exists: (path) => unifiedFileSystem.exists(path),
    readFile: (path) => unifiedFileSystem.readFile(path),
    ...dataAPI,
  };

  const fileAPI: FileAPI<D> = {
    ...directoryAPI,
  };

  return {
    directoryAPI,
    unifiedFileSystem,
    fileAPI,
    dataAPI,
  };
};
