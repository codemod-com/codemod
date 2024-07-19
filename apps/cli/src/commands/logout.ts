import type { Printer } from "@codemod-com/printer";
import keytar from "keytar";
import { revokeCLIToken } from "../apis.js";
import { CredentialsStorageType } from "../credentialsStorage.js";
import { credentialsStorage, getCurrentUserData } from "../utils.js";

export const handleLogoutCliCommand = async (options: {
  printer: Printer;
}) => {
  const { printer } = options;

  const userData = await getCurrentUserData();

  if (userData === null) {
    printer.printConsoleMessage("info", "You are already logged out.");
    return;
  }

  try {
    await revokeCLIToken(userData.token);
  } catch (err) {
    //
  }

  await credentialsStorage.delete(CredentialsStorageType.ACCOUNT);

  printer.printConsoleMessage("info", "You have been successfully logged out.");
};
