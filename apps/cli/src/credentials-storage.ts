import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { chalk } from "@codemod-com/printer";
import { codemodDirectoryPath } from "#utils/constants.js";

export enum CredentialsStorageType {
  ACCOUNT = "user-account",
}

const keytar = async () => {
  return (await import("keytar")).default;
};

//Sometimes we running production CLI from local build, credentials should be stored in different places.
const SERVICE = `codemod.com${process.env.NODE_ENV === "production" ? "" : `-${process.env.NODE_ENV}`}`;
let alreadyWarned = false;

async function prepareShim() {
  await mkdir(codemodDirectoryPath, { recursive: true });
}

async function findShimCredentials(service: string) {
  const entries = (await readdir(codemodDirectoryPath)).filter((file) =>
    file.startsWith(`${service}:`),
  );

  return await Promise.all(
    entries.map(async (file) => {
      return {
        account: file.split(":")[1] as string,
        password: await readFile(join(codemodDirectoryPath, file), {
          encoding: "utf-8",
        }),
      };
    }),
  );
}

async function warnMessage(error: any) {
  const isShimLoggedIn = (await findShimCredentials(SERVICE)).length > 0;

  if (!alreadyWarned && !isShimLoggedIn) {
    alreadyWarned = true;
    console.warn(
      chalk.red(
        String(error),
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
          "\n\nIf you were not able to install the necessary package or CLI was not able to detect the installation " +
            "please reach out to us at our Community Slack channel.",
        ),
        chalk.yellow(
          "\nYou can still use the CLI with file-based replacement that will store your credentials at your home directory.",
        ),
      ),
    );
  }
}

const keytarShim = {
  setPassword: async (service: string, account: string, password: string) => {
    try {
      return await (await keytar()).setPassword(service, account, password);
    } catch (error: any) {
      await prepareShim();
      await warnMessage(error);
      await writeFile(
        join(codemodDirectoryPath, `${service}:${account}`),
        password,
      );
    }
  },
  findCredentials: async (service: string) => {
    try {
      return await (await keytar()).findCredentials(service);
    } catch (error: any) {
      await prepareShim();
      await warnMessage(error);
      return await findShimCredentials(service);
    }
  },
  deletePassword: async (service: string, account: string) => {
    try {
      return await (await keytar()).deletePassword(service, account);
    } catch (error: any) {
      await prepareShim();
      await warnMessage(error);
      try {
        await unlink(join(codemodDirectoryPath, `${service}:${account}`));
        return true;
      } catch {
        return false;
      }
    }
  },
};

/**
 * A class to store and retrieve credentials securely.
 * It uses the `keyring-rs` package to store the credentials.
 * The credentials are stored in the system's keychain.
 */
export class CredentialsStorage {
  private _credentials: { [key in CredentialsStorageType]?: string } = {};

  async set(type: CredentialsStorageType, value: string) {
    await keytarShim.setPassword(SERVICE, type, value);
    this._credentials[type] = value;
  }

  async get(type: CredentialsStorageType) {
    const credentials = (await keytarShim.findCredentials(SERVICE)).find(
      ({ account }) => account === type,
    );

    if (credentials) {
      this._credentials[type] = credentials.password;
      return credentials.password;
    }

    return null;
  }

  async delete(type: CredentialsStorageType) {
    await keytarShim.deletePassword(SERVICE, type);
    delete this._credentials[type];
  }
}

export const credentialsStorage = new CredentialsStorage();
