import { Entry } from "@napi-rs/keyring";

export enum CredentialsStorageType {
  ACCOUNT = "user-account",
}

//Sometimes we running production CLI from local build, credentials should be stored in different places.
const SERVICE = `codemod.com${process.env.NODE_ENV === "production" ? "" : `-${process.env.NODE_ENV}`}`;

/**
 * A class to store and retrieve credentials securely.
 * It uses the `keyring-rs` package to store the credentials.
 * The credentials are stored in the system's keychain.
 */
export class CredentialsStorage {
  private _credentials: { [key in CredentialsStorageType]?: string } = {};

  async set(type: CredentialsStorageType, value: string) {
    new Entry(SERVICE, type).setPassword(value);
    this._credentials[type] = value;
  }

  async get(type: CredentialsStorageType) {
    if (this._credentials[type]) {
      return this._credentials[type];
    }

    const password = new Entry(SERVICE, type).getPassword();
    if (password === null) return null;

    this._credentials[type] = password;
    return password;
  }

  async delete(type: CredentialsStorageType) {
    new Entry(SERVICE, type).deletePassword();
    delete this._credentials[type];
  }
}

export const credentialsStorage = new CredentialsStorage();
