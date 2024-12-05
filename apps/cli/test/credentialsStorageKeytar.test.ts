import { fs, vol } from "memfs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock all fs promises functions
vi.mock("node:fs/promises", () => fs.promises);

// Use a mock homedir in order to reliably have a memfs home directory
vi.mock("node:os", () => ({ homedir: () => "/home/codemod-test/" }));

// this set of tests does more advanced mocking of keytar
vi.mock("keytar", () => ({
  default: {
    setPassword: vi.fn(),
    findCredentials: vi.fn(),
    deletePassword: vi.fn(),
  },
}));

import {
  CredentialsStorage,
  CredentialsStorageType,
} from "../src/credentials-storage.js";

const testAccount = CredentialsStorageType.ACCOUNT;
const testPassword = "test-password";

describe("keytar operations", () => {
  let consoleSpy: any;

  beforeEach(() => {
    vol.reset();
    consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("should store credentials using keytar when available", async () => {
    const storage = new CredentialsStorage();
    const keytar = await import("keytar");

    await storage.set(testAccount, testPassword);

    expect(keytar.default.setPassword).toHaveBeenCalledWith(
      "codemod.com-test",
      testAccount,
      testPassword,
    );
  });

  it("should delete credentials using keytar when available", async () => {
    const storage = new CredentialsStorage();
    const keytar = await import("keytar");

    await storage.delete(testAccount);

    expect(keytar.default.deletePassword).toHaveBeenCalledWith(
      "codemod.com-test",
      testAccount,
    );
  });

  it("should fall back to file system when keytar fails", async () => {
    const storage = new CredentialsStorage();
    const keytar = await import("keytar");

    // Mock keytar failure
    vi.mocked(keytar.default.setPassword).mockRejectedValueOnce(
      new Error("Keytar failed"),
    );

    await storage.set(testAccount, testPassword);

    // Verify warning was shown
    expect(consoleSpy).toHaveBeenCalled();

    // Verify file was created
    const savedPassword = await fs.promises.readFile(
      `/home/codemod-test/.codemod/codemod.com-test:${testAccount}`,
      "utf-8",
    );
    expect(savedPassword).toBe(testPassword);
  });

  it("should handle file system deletion when keytar fails", async () => {
    const storage = new CredentialsStorage();
    const keytar = await import("keytar");

    // Setup initial file
    await storage.set(testAccount, testPassword);

    // Mock keytar failure for delete
    vi.mocked(keytar.default.deletePassword).mockRejectedValueOnce(
      new Error("Keytar failed"),
    );

    await storage.delete(testAccount);

    // Verify file was deleted
    expect(
      fs.promises.access(
        `/home/codemod-test/.codemod/codemod.com-test:${testAccount}`,
      ),
    ).rejects.toThrow();
  });
});
