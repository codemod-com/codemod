import { useTranslation } from "react-i18next";
import { ShareButton } from "@features/share/ShareButton";
import { Backspace as BackspaceIcon } from "@phosphor-icons/react/dist/csr/Backspace";
import { Button } from "@studio/components/ui/button";
import { useModStore } from "@studio/store/mod";
import { useSnippetsStore } from "@studio/store/snippets";

type ButtonProps = {
  text: string;
  hintText: string;
  disabled: boolean;
};

const ClearAllButton = () => {
const { t } = useTranslation("(website)/studio/main/Header");

  const { clearAll } = useSnippetsStore();
  const { setContent } = useModStore();
  const hintText = "Clear all inputs";
  const onClick = () => {
    clearAll();
    setContent("");
  };

  return (
    <Button
      onClick={onClick}
      size="xs"
      variant="outline"
      className="flex gap-1"
      hint={<p className="font-normal">{hintText}</p>}
    >
      <BackspaceIcon className="h-4 w-4" />{t('clear-all-inputs')}</Button>
  );
};
export const HeaderButtons = () => {
  return (
    <>
      <ClearAllButton />
      <ShareButton />
    </>
  );
};
