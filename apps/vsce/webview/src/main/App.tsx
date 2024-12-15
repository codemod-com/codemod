import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import type { MainWebviewViewProps } from "../../../src/selectors/selectMainWebviewViewProps";
import CodemodEngineNodeNotFound from "../CodemodEngineNodeNotFound";
import { App as CodemodList } from "../codemodList/App";
import { useTheme } from "../shared/Snippet/useTheme";
import type { WebviewMessage } from "../shared/types";

const toastContainerProps = {
  pauseOnHover: false,
  pauseOnFocusLoss: false,
  hideProgressBar: false,
  closeOnClick: false,
  closeButton: false,
  draggable: false,
  autoClose: false as const,
  enableMultiContainer: true,
};

declare global {
  interface Window {
    mainWebviewViewProps: MainWebviewViewProps;
  }
}

function App() {
  const { t } = useTranslation("");

  const ref = useRef(null);
  const theme = useTheme();
  const [screenWidth, setScreenWidth] = useState<number | null>(null);
  const [mainWebviewViewProps, setMainWebviewViewProps] = useState(
    window.mainWebviewViewProps,
  );

  useEffect(() => {
    const handler = (event: MessageEvent<WebviewMessage>) => {
      if (event.data.kind !== "webview.main.setProps") {
        return;
      }

      setMainWebviewViewProps(event.data.props);
    };

    window.addEventListener("message", handler);

    return () => {
      window.removeEventListener("message", handler);
    };
  }, []);

  useEffect(() => {
    if (ResizeObserver === undefined) {
      return undefined;
    }

    if (ref.current === null) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const container = entries[0] ?? null;
      if (container === null) {
        return;
      }
      const {
        contentRect: { width },
      } = container;

      setScreenWidth(width);
    });

    resizeObserver.observe(ref.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  if (mainWebviewViewProps === null) {
    return (
      <main className="App" ref={ref}>
        <p className="warning">
          {t("open-a-workspace-folder-to-use-the-codemod-vscode-extension")}
        </p>
      </main>
    );
  }

  if (!mainWebviewViewProps.codemodEngineNodeLocated) {
    return <CodemodEngineNodeNotFound />;
  }

  return (
    <main className="App" ref={ref}>
      {mainWebviewViewProps.activeTabId === "codemods" ? (
        <CodemodList screenWidth={screenWidth} {...mainWebviewViewProps} />
      ) : null}
      <ToastContainer
        {...toastContainerProps}
        containerId="codemodListToastContainer"
        position="bottom-right"
        theme={theme === "vs-light" ? "light" : "dark"}
      />
      <ToastContainer
        {...toastContainerProps}
        containerId="primarySidebarToastContainer"
        theme={theme === "vs-light" ? "light" : "dark"}
        position="top-right"
      />
    </main>
  );
}

export default App;
