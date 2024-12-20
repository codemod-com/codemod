import { useTranslation } from "react-i18next";
export * from "./User";
export * from "./VSCode";
export * from "./Example";
export * from "./Chevrons";
export * from "./Download";
export * from "./LogoutIcon";
export * from "./CodemodLogo";
export * from "./VisibilityIcon";

export function CheckIcon() {
const { t } = useTranslation("(website)/studio/src/icons");

  return (
    <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16">
      <title>{t('check-icon')}</title>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
      />
    </svg>
  );
}

export function ChevronUpDownIcon() {
const { t } = useTranslation("(website)/studio/src/icons");

  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <title>{t('chevron-up-down-icon')}</title>
      <path d="m7 15 5 5 5-5" />
      <path d="m7 9 5-5 5 5" />
    </svg>
  );
}

export function SearchIcon() {
const { t } = useTranslation("(website)/studio/src/icons");

  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <title>{t('search-icon')}</title>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
