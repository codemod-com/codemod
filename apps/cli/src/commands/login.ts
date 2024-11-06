import express from "express";
import open from "open";

import { type Printer, chalk } from "@codemod-com/printer";
import { Issuer, type TokenSet, generators } from "openid-client";
import { getCurrentUserData } from "#auth-utils.js";
import {
  CredentialsStorageType,
  credentialsStorage,
} from "#credentials-storage.js";

const AUTH_OPENID_ISSUER = "";
const CLIENT_ID = "";
const authSuccessUrl = "";

export const handleLoginCliCommand = async (options: {
  printer: Printer;
}) => {
  const { printer } = options;

  const userData = await getCurrentUserData();

  if (userData !== null) {
    printer.printConsoleMessage(
      "info",
      chalk.bold.cyan("You're already logged in."),
    );
    return;
  }

  const issuer = await Issuer.discover(AUTH_OPENID_ISSUER);

  const spinner = printer.withLoaderMessage(
    chalk.cyan("Redirecting to Codemod sign-in page"),
  );

  const promise = new Promise<TokenSet>((resolve, reject) => {
    let promiseAlreadyResolved = false;
    const client = new issuer.Client({
      client_id: CLIENT_ID,
      redirect_uris: ["http://localhost:3301/callback"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
    });

    const app = express();

    let timeout: NodeJS.Timeout;

    app.get("/callback", async (req, res) => {
      if (promiseAlreadyResolved) {
        res.redirect(authSuccessUrl);
        return;
      }

      const params = client.callbackParams(req);

      try {
        const tokenSet = await client.callback(
          "http://localhost:3301/callback",
          params,
          {
            code_verifier,
          },
        );

        resolve(tokenSet);
        clearTimeout(timeout);
        promiseAlreadyResolved = true;

        res.redirect(authSuccessUrl);

        process.nextTick(() => {
          server.close();
        });
      } catch (error) {
        if (!promiseAlreadyResolved) {
          timeout = setTimeout(() => {
            res.send(
              `Error: ${(error as Error).message}\n\nPlease close this window and try again. `,
            );
            promiseAlreadyResolved = true;
            reject(error);
          }, 10000);
        } else {
          res.redirect(authSuccessUrl);
        }
      }
    });

    const server = app.listen(3301);

    const code_verifier = generators.codeVerifier();
    const code_challenge = generators.codeChallenge(code_verifier);

    const authorizationUrl = client.authorizationUrl({
      scope: "openid email profile",
      code_challenge,
      code_challenge_method: "S256",
    });

    void open(authorizationUrl);
    spinner.start();
  });

  const { access_token } = await promise;

  if (access_token) {
    await credentialsStorage.set(CredentialsStorageType.ACCOUNT, access_token);
  }

  spinner.succeed();

  printer.printConsoleMessage(
    "info",
    chalk.bold.cyan("You are successfully logged in."),
  );
};
