import type { PrinterBlueprint } from "@codemod-com/printer";
import keytar from "keytar";
import { revokeCLIToken } from "../apis.js";
import { getCurrentUserData } from "../utils.js";

export const handleLogoutCliCommand = async (options: {
  printer: PrinterBlueprint;
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

  await keytar.deletePassword("codemod.com", userData.account);

  printer.printConsoleMessage("info", "You have been successfully logged out.");
};
