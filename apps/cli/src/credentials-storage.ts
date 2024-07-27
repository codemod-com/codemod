import os from "node:os";

import { chalk } from "@codemod-com/printer";

export enum CredentialsStorageType {
  ACCOUNT = "user-account",
}

//Sometimes we running production CLI from local build, credentials should be stored in different places.
const SERVICE = `codemod.com${process.env.NODE_ENV === "production" ? "" : `-${process.env.NODE_ENV}`}`;

const getKeytar = async () => {
  try {
    return await import("keytar");
  } catch (err) {
    if (os.platform() === "linux") {
      throw new Error(
        chalk(
          `Codemod CLI uses "keytar" to store your credentials securely.`,
          `\nPlease make sure you have "libsecret" installed on your system.`,
          "\nDepending on your distribution, you will need to run the following command",
          "\nDebian/Ubuntu:",
          chalk.bold("sudo apt-get install libsecret-1-dev"),
          "\nFedora:",
          chalk.bold("sudo dnf install libsecret"),
          "\nArch Linux:",
          chalk.bold("sudo pacman -S libsecret"),
          `\n\n${String(err)}`,
        ),
      );
    }

    throw err;
  }
};

/**
 * A class to store and retrieve credentials securely.
 * It uses the `keyring-rs` package to store the credentials.
 * The credentials are stored in the system's keychain.
 */
export class CredentialsStorage {
  private _credentials: { [key in CredentialsStorageType]?: string } = {};

  async set(type: CredentialsStorageType, value: string) {
    await getKeytar().then(({ default: keytar }) =>
      keytar.setPassword(SERVICE, type, value),
    );
    this._credentials[type] = value;
  }

  async get(type: CredentialsStorageType) {
    const credentials = (
      await getKeytar().then(({ default: keytar }) =>
        keytar.findCredentials(SERVICE),
      )
    ).find(({ account }) => account === type);

    if (credentials) {
      this._credentials[type] = credentials.password;
      return credentials.password;
    }

    return null;
  }

  async delete(type: CredentialsStorageType) {
    await getKeytar().then(({ default: keytar }) =>
      keytar.deletePassword(SERVICE, type),
    );
    delete this._credentials[type];
  }
}

export const credentialsStorage = new CredentialsStorage();
