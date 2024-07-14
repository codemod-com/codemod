import { ShareButton } from "@features/share/ShareButton";
import { usePublicLinkSharing } from "@features/share/usePublicLinkSharing";
import { Backspace as BackspaceIcon } from "@phosphor-icons/react/dist/csr/Backspace";
import { Link as LinkIcon } from "@phosphor-icons/react/dist/csr/Link";
import { Button } from "@studio/components/ui/button";
import { useModStore } from "@studio/store/mod";
import { useSnippetsStore } from "@studio/store/snippets";

type ButtonProps = {
  text: string;
  hintText: string;
  disabled: boolean;
};

const ClearAllButton = () => {
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
      <BackspaceIcon className="h-4 w-4" />
      Clear all inputs
    </Button>
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
