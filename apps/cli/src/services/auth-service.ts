import type { Printer } from "@codemod-com/printer";
import type { AuthServiceInterface } from "@codemod.com/workflow";

import { getGithubAPIKey, getGithubAvailableScope } from "#api.js";
import {
  getCurrentUserOrLogin,
  requestGithubPermissions,
} from "#auth-utils.js";
import {
  CredentialsStorageType,
  credentialsStorage,
} from "#credentials-storage.js";

export class AuthService implements AuthServiceInterface {
  private githubApiKey: string | undefined;

  constructor(private _printer: Printer) {}

  async getGithubAPIKey(): Promise<string | undefined> {
    if (this.githubApiKey) {
      return this.githubApiKey;
    }

    const userData = await getCurrentUserOrLogin({
      message:
        "Authentication is required to work with github services. Proceed?",
      printer: this._printer,
      onEmptyAfterLoginText: "Failed to authenticate with github services.",
    });

    if (userData) {
      const apiKey = await getGithubAPIKey(userData.token);
      if (!apiKey) {
        try {
          // await revokeCLIToken(userData.token);
        } catch (e) {
          //
        }
        await credentialsStorage.delete(CredentialsStorageType.ACCOUNT);
        throw new Error("Failed to get github API key. Please try again.");
      }

      this.githubApiKey = apiKey;

      return apiKey;
    }
  }

  async ensureGithubScopes(scopes: string[]): Promise<boolean> {
    const apiKey = await this.getGithubAPIKey();

    if (!apiKey) {
      return false;
    }

    const availableScopes = await getGithubAvailableScope(apiKey);
    const allScopesAvailable = scopes?.every((scope) =>
      availableScopes?.includes(scope),
    );

    if (allScopesAvailable) {
      return true;
    }

    try {
      await requestGithubPermissions({
        scopes,
        printer: this._printer,
      });
      this.githubApiKey = undefined;
      return true;
    } catch (e) {
      return false;
    }
  }
}
