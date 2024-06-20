import { createSharedLink } from "@studio/actions/createSharedLink";
import { useShareLink } from "@studio/hooks/useShareLink";
import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";

export let usePublicLinkSharing = () => {
  let { getURL } = useShareLink();
  let [isCreating, setIsCreating] = useState(false);

  let getShareLink = useCallback(async () => {
    setIsCreating(true);

    let url = await getURL();

    if (url === null) {
      return;
    }

    let shortURL = await createSharedLink("studio", { url: url.toString() });

    if (!shortURL) {
      toast.error(
        "There was an error creating a short link. Please try again later.",
      );
    } else {
      navigator.clipboard.writeText(shortURL);
      toast.success("Copied the shared link into the clipboard");
    }

    setIsCreating(false);
  }, [getURL]);

  return {
    getShareLink,
    isCreating,
  };
};
