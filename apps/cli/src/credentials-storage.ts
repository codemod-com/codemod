import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { chalk } from "@codemod-com/printer";
import { codemodDirectoryPath } from "#utils/constants.js";

export enum CredentialsStorageType {
  ACCOUNT = "user-account",
}

const keytarShim = {
  default: {
    setPassword: async (service: string, account: string, password: string) =>
      writeFile(join(codemodDirectoryPath, `${service}:${account}`), password),
    findCredentials: async (service: string) => {
      const entries = await readdir(codemodDirectoryPath).then((dir) =>
        dir.filter((file) => file.startsWith(`${service}:`)),
      );

      return Promise.all(
        entries.map(async (file) => ({
          account: file.split(":")[1],
          password: await readFile(join(codemodDirectoryPath, file), {
            encoding: "utf-8",
          }),
        })),
      );
    },
    deletePassword: async (service: string, account: string) =>
      unlink(join(codemodDirectoryPath, `${service}:${account}`))
        .then(() => true)
        .catch(() => false),
  },
};

//Sometimes we running production CLI from local build, credentials should be stored in different places.
const SERVICE = `codemod.com${process.env.NODE_ENV === "production" ? "" : `-${process.env.NODE_ENV}`}`;
let alreadyWarned = false;

const getKeytar = async () => {
  try {
    return await import("keytar");
  } catch (err) {
    const isShimLoggedIn = await keytarShim.default
      .findCredentials(SERVICE)
      .then((creds) => creds.length > 0);

    if (!alreadyWarned && !isShimLoggedIn) {
      alreadyWarned = true;
      console.warn(
        chalk.red(
          String(err),
          `\n\nCodemod CLI uses "keytar" to store your credentials securely.`,
          `\nPlease make sure you have "libsecret" installed on your system.`,
          "\nDepending on your distribution, you will need to run the following command",
          "\nDebian/Ubuntu:",
          chalk.bold("sudo apt-get install libsecret-1-dev"),
          "\nFedora:",
          chalk.bold("sudo dnf install libsecret"),
          "\nArch Linux:",
          chalk.bold("sudo pacman -S libsecret"),
          chalk.cyan(
            "\n\nIf you were not able to install the necessary package or CLI was not able to detect the installation" +
              "please reach out to us at our Community Slack channel.",
          ),
          chalk.yellow(
            "\nYou can still use the CLI with file-based replacement that will store your credentials at your home directory.",
          ),
        ),
      );
    }

    await mkdir(codemodDirectoryPath, { recursive: true });
    return keytarShim;
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
