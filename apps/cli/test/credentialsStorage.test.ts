import { fs, type DirectoryJSON, vol } from "memfs";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock all fs promises functions
vi.mock("node:fs/promises", () => fs.promises);

// Use a mock homedir in order to reliably have a memfs home directory
vi.mock("node:os", () => ({ homedir: () => "/home/codemod-test/" }));

import {
  CredentialsStorage,
  CredentialsStorageType,
} from "../src/credentials-storage.js";

describe("CredentialsStorage", () => {
  const testService = "codemod.com-test";
  const testAccount = CredentialsStorageType.ACCOUNT;
  const testPassword = "test-password";

  describe("when .codemod directory does not exist", () => {
    beforeEach(() => {
      vol.reset();
    });

    it("should return null without throwing an error", async () => {
      const storage = new CredentialsStorage();
      const result = await storage.get(testAccount);

      expect(result).toBeNull();
    });
  });

  describe("when there is a different kind of error reading the directory", () => {
    beforeEach(() => {
      vol.reset();
    });

    it("should rethrow the error", async () => {
      // the error we are using to test is ENOTDIR, ie readDir on a file
      vol.fromJSON({ "": "" }, "/home/codemod-test/.codemod");

      const storage = new CredentialsStorage();
      expect(storage.get(testAccount)).rejects.toThrow();
    });
  });

  describe("when .codemod directory exists", () => {
    beforeEach(() => {
      vol.reset();
    });

    it("should return null when no credentials are found", async () => {
      vol.fromJSON({}, "/home/codemod-test/.codemod");
      const storage = new CredentialsStorage();
      const result = await storage.get(testAccount);

      expect(result).toBeNull();
    });

    it("should retrieve existing credentials when found", async () => {
      const directory: DirectoryJSON = {
        [`${testService}:${testAccount}`]: testPassword,
      };
      vol.fromJSON(directory, "/home/codemod-test/.codemod");
      const storage = new CredentialsStorage();
      const result = await storage.get(testAccount);

      expect(result).toBe(testPassword);
    });
  });
});
