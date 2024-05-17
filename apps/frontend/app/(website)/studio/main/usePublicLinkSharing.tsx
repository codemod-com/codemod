import { createSharedLink } from "@studio/actions/createSharedLink";
import { useShareLink } from "@studio/hooks/useShareLink";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";

export let usePublicLinkSharing = () => {
  let { getURL } = useShareLink();
  let [isCreating, setIsCreating] = useState(false);

  let getShareLink = useCallback(async () => {
    let url = getURL();

    if (url === null) {
      toast.error(
        "There was an error creating a short link. Please try again later.",
      );
      return;
    }

    setIsCreating(true);

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
