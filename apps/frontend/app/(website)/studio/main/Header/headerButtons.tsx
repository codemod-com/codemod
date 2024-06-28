import { Backspace as BackspaceIcon } from "@phosphor-icons/react/dist/csr/Backspace";
import { Link as LinkIcon } from "@phosphor-icons/react/dist/csr/Link";
import { Button } from "@studio/components/ui/button";
import { useModStore } from "@studio/store/mod";
import { useSnippetsStore } from "@studio/store/snippets";
import { usePublicLinkSharing } from "../usePublicLinkSharing";

type ButtonProps = {
  text: string;
  hintText: string;
  disabled: boolean;
};

export const HeaderButtons = () => {
  const { clearAll } = useSnippetsStore();
  const { setContent } = useModStore();
  const { isCreating: isShareURLBeingCreated } = usePublicLinkSharing();
  const { getShareLink } = usePublicLinkSharing();

  const buttonsData = [
    {
      hintText: "Clear all inputs",
      onClick: () => {
        clearAll();
        setContent("");
      },
      Icon: BackspaceIcon,
      text: "Clear all inputs",
    },
    {
      hintText: "Share the codemod",
      onClick: getShareLink,
      Icon: isShareURLBeingCreated ? LinkIcon : null,
      text: "Share",
      /* FIXME: refactor button component to replace loading icon with the button's icon */
      props: { isLoading: isShareURLBeingCreated },
    },
  ];

  return (
    <>
      {buttonsData.map(({ Icon, hintText, ...button }, index) => (
        <Button
          key={index}
          size="xs"
          variant="outline"
          className="flex gap-1"
          hint={<p className="font-normal">{hintText}</p>}
          {...button}
        >
          {Icon && <Icon className="h-4 w-4" />}
          {button.text}
        </Button>
      ))}
    </>
  );
};
