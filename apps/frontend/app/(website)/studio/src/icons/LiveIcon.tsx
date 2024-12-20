import { useTranslation } from "react-i18next";
const LiveIcon = ({ color = "red-500" }: { color?: string }) =>  {
const { t } = useTranslation("(website)/studio/src/icons");

return (
  <div
    style={{ backgroundColor: color }}
    className={`mx-2 flex h-auto items-center bg-red-500 rounded px-2 py-0 text-sm text-gray-text-dark-title`}
  >
    <span className="mr-1 h-2 w-2 rounded bg-white p-1" />{t('live')}</div>
)
};

export default LiveIcon;
