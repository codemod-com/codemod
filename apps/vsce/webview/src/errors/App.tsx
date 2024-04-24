import {
  VSCodeDataGrid,
  VSCodeDataGridCell,
  VSCodeDataGridRow,
} from "@vscode/webview-ui-toolkit/react";
import { useEffect, useState } from "react";
import type { WebviewMessage } from "../../../src/components/webview/webviewEvents";
import type { ExecutionError } from "../../../src/errors/types";
import type { ErrorWebviewViewProps } from "../../../src/selectors/selectErrorWebviewViewProps";
import styles from "./style.module.css";

const header = (
  <VSCodeDataGridRow row-type="sticky-header">
    <VSCodeDataGridCell cell-type="columnheader" grid-column="1">
      Message
    </VSCodeDataGridCell>
    <VSCodeDataGridCell cell-type="columnheader" grid-column="2">
      File Path
    </VSCodeDataGridCell>
  </VSCodeDataGridRow>
);

const buildExecutionErrorRow = (
  executionError: ExecutionError,
  index: number,
) => {
  return (
    <VSCodeDataGridRow key={index}>
      <VSCodeDataGridCell grid-column="1">
        {executionError.message}
      </VSCodeDataGridCell>
      <VSCodeDataGridCell grid-column="2">
        {executionError.path ?? ""}
      </VSCodeDataGridCell>
    </VSCodeDataGridRow>
  );
};

declare global {
  interface Window {
    errorWebviewViewProps: ErrorWebviewViewProps;
  }
}

export const App = () => {
  const [props, setProps] = useState(window.errorWebviewViewProps);

  useEffect(() => {
    const handler = (event: MessageEvent<WebviewMessage>) => {
      if (event.data.kind !== "webview.error.setProps") {
        return;
      }

      setProps(event.data.errorWebviewViewProps);
    };

    window.addEventListener("message", handler);

    return () => {
      window.removeEventListener("message", handler);
    };
  }, []);

  if (props.kind !== "CASE_SELECTED") {
    return (
      <main>
        <p className={styles.welcomeMessage}>
          {props.kind === "MAIN_WEBVIEW_VIEW_NOT_VISIBLE"
            ? "Open the left-sided Codemod View Container to see the errors."
            : props.kind === "CODEMOD_RUNS_TAB_NOT_ACTIVE"
              ? "Open the 'Codemod Runs' tab to see the errors."
              : "Choose a codemod run from 'Codemod Runs' to see its errors."}
        </p>
      </main>
    );
  }

  if (props.executionErrors.length === 0) {
    return (
      <main>
        <p className={styles.welcomeMessage}>
          No execution errors found for the selected codemod run.
        </p>
      </main>
    );
  }

  const rows = props.executionErrors.map(buildExecutionErrorRow);

  return (
    <main>
      <VSCodeDataGrid gridTemplateColumns="50% 50%">
        {header}
        {rows}
      </VSCodeDataGrid>
    </main>
  );
};
