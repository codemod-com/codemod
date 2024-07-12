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

  const buttonData = {
    hintText: "Clear all inputs",
    onClick: () => {
      clearAll();
      setContent("");
    },
    Icon: BackspaceIcon,
    text: "Clear all inputs",
  };

  return (
    <Button
      size="xs"
      variant="outline"
      className="flex gap-1"
      hint={<p className="font-normal">{buttonData.hintText}</p>}
      {...buttonData}
    >
      <BackspaceIcon className="h-4 w-4" />
      {buttonData.text}
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
