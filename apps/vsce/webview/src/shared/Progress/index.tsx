import { useTranslation } from "react-i18next";
import { VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import s from "./style.module.css";

const Progress = () => {
  const { t } = useTranslation("../shared/Progress");

  return (
    <div className={s.loadingContainer}>
      <VSCodeProgressRing className={s.progressBar} />
      <span aria-label={t("loading-message")}>{t("loading-ellipsis")}</span>
    </div>
  );
};

export default Progress;
