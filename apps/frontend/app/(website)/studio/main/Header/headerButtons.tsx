import { Backspace as BackspaceIcon } from "@phosphor-icons/react/dist/csr/Backspace";
import { Link as LinkIcon } from "@phosphor-icons/react/dist/csr/Link";
import { Button } from "@studio/components/ui/button";
import { useModStore } from "@studio/store/zustand/mod";
import { useSnippetStore } from "@studio/store/zustand/snippets";
import { usePublicLinkSharing } from "../usePublicLinkSharing";

type ButtonProps = {
  text: string;
  hintText: string;
  disabled: boolean;
};

export let HeaderButtons = () => {
  let { setInput, setOutput } = useSnippetStore();
  let { setContent } = useModStore();
  let { isCreating: isShareURLBeingCreated } = usePublicLinkSharing();
  let { getShareLink } = usePublicLinkSharing();

  let buttonsData = [
    {
      hintText: "Clear all inputs",
      onClick: () => {
        setInput("");
        setOutput("");
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
