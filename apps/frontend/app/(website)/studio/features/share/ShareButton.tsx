import { usePublicLinkSharing } from "@features/share/usePublicLinkSharing";
import { useSharedState } from "@features/share/useSharedState";
import { Link as LinkIcon } from "@phosphor-icons/react/dist/csr/Link";
import { Button } from "@studio/components/ui/button";

export const ShareButton = () => {
  useSharedState();
  const { isCreating: isShareURLBeingCreated } = usePublicLinkSharing();
  const { getShareLink } = usePublicLinkSharing();

  const Icon = isShareURLBeingCreated ? LinkIcon : null;
  const hintText = "Share the codemod";

  const buttonProps = {
    onClick: getShareLink,
    text: "Share",
    props: { isLoading: isShareURLBeingCreated },
  };

  return (
    <Button
      size="xs"
      variant="outline"
      className="flex gap-1"
      hint={<p className="font-normal">{hintText}</p>}
      {...buttonProps}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {buttonProps.text}
    </Button>
  );
};
