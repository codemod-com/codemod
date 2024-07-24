import * as os from "node:os";
import { chalk } from "@codemod-com/printer";
import keytar from "keytar";

export enum CredentialsStorageType {
  ACCOUNT = "user-account",
}

//Sometimes we running production CLI from local build, credentials should be stored in different places.
const SERVICE = `codemod.com${process.env.NODE_ENV === "production" ? "" : `-${process.env.NODE_ENV}`}`;

/**
 * A class to store and retrieve credentials securely.
 * It uses the `keytar` package to store the credentials.
 * The credentials are stored in the system's keychain.
 * On Linux, it uses `libsecret` to store the credentials.
 * On macOS, it uses the Keychain.
 * On Windows, it uses the Credential Vault.
 */
export class CredentialsStorage {
  private _credentials: { [key in CredentialsStorageType]?: string } = {};

  async set(type: CredentialsStorageType, value: string) {
    await keytar.setPassword(SERVICE, type, value);
    this._credentials[type] = value;
  }

  async get(type: CredentialsStorageType) {
    if (this._credentials[type]) {
      return this._credentials[type];
    }

    try {
      const credentials = (await keytar.findCredentials(SERVICE)).find(
        ({ account }) => account === type,
      );
      if (credentials) {
        this._credentials[type] = credentials.password;
        return credentials.password;
      }
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
  }

  async delete(type: CredentialsStorageType) {
    await keytar.deletePassword(SERVICE, type);
    delete this._credentials[type];
  }
}
