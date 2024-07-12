import { usePublicLinkSharing } from "@features/share/usePublicLinkSharing";
import { useSharedState } from "@features/share/useSharedState";
import { Link as LinkIcon } from "@phosphor-icons/react/dist/csr/Link";
import { Button } from "@studio/components/ui/button";

export const ShareButton = () => {
  useSharedState();
  const { isCreating: isShareURLBeingCreated } = usePublicLinkSharing();
  const { getShareLink } = usePublicLinkSharing();

  const Icon = isShareURLBeingCreated ? LinkIcon : null;

  const buttonProps = {
    hintText: "Share the codemod",
    onClick: getShareLink,
    text: "Share",
    /* FIXME: refactor button component to replace loading icon with the button's icon */
    props: { isLoading: isShareURLBeingCreated },
  };

  return (
    <Button
      size="xs"
      variant="outline"
      className="flex gap-1"
      hint={<p className="font-normal">{buttonProps.hintText}</p>}
      {...buttonProps}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {buttonProps.text}
    </Button>
  );
};
