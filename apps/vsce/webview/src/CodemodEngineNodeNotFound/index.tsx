import { useTranslation } from "react-i18next";
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import cn from "classnames";
import styles from "./style.module.css";

const INSTALL_CODEMOD_ENGINE_NODE_COMMAND_NPM = "npm i -g codemod";
const INSTALL_CODEMOD_ENGINE_NODE_COMMAND_PNPM = "pnpm i -g codemod";

const handleCopyCommand = (command: string) => {
  navigator.clipboard.writeText(command);
};

const CodemodEngineNodeNotFound = () => {
  const { t } = useTranslation("../CodemodEngineNodeNotFound");

  return (
    <div className={styles.root}>
      <h1>{t("halfway-there")}</h1>
      <p>
        {t(
          "use-one-of-the-two-commands-below-to-install-the-latest-codemod-cli-and-complete-the-installation",
        )}
      </p>
      {[
        INSTALL_CODEMOD_ENGINE_NODE_COMMAND_NPM,
        INSTALL_CODEMOD_ENGINE_NODE_COMMAND_PNPM,
      ].map((command) => (
        <VSCodeTextField
          key={command}
          className={styles.command}
          readOnly
          value={command}
        >
          <span
            slot="start"
            className={cn(styles.icon, "codicon", "codicon-chevron-right")}
          />
          <span
            slot="end"
            className={cn(styles.icon, "codicon", "codicon-copy")}
            onClick={() => handleCopyCommand(command)}
          />
        </VSCodeTextField>
      ))}

      <small className={styles.reminder}>
        {t(
          "reminder-codemod-is-cli-centric-so-you-can-use-its-core-features-without-an-ide-and-easily-integrate-it-with-the-existing-tools-in-your-workflow",
        )}
      </small>
    </div>
  );
};

export default CodemodEngineNodeNotFound;
