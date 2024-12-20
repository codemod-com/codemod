import { useTranslation } from "react-i18next";
import { usePublicLinkSharing } from "@features/share/usePublicLinkSharing";
import { useSharedState } from "@features/share/useSharedState";
import { Link as LinkIcon } from "@phosphor-icons/react/dist/csr/Link";
import { Button } from "@studio/components/ui/button";

export const ShareButton = () => {
const { t } = useTranslation("(website)/studio/features/share");

  useSharedState();
  const { isCreating: isShareURLBeingCreated } = usePublicLinkSharing();
  const { getShareLink } = usePublicLinkSharing();
  const hintText = "Share the codemod";

  return (
    <Button
      onClick={getShareLink}
      size="xs"
      isLoading={isShareURLBeingCreated}
      variant="outline"
      className="flex gap-1"
      hint={<p className="font-normal">{hintText}</p>}
    >
      {isShareURLBeingCreated && <LinkIcon className="h-4 w-4" />}{t('share')}</Button>
  );
};
