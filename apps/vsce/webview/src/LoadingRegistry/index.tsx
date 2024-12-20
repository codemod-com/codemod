import { useTranslation } from "react-i18next";
import styles from "./style.module.css";

const LoadingRegistry = () => {
  const { t } = useTranslation("../LoadingRegistry");

  return (
    <div className={styles.root}>
      <p className={styles.text}>{t("loading-the-latest-codemod-registry")}</p>
    </div>
  );
};

export default LoadingRegistry;
