import { createSharedLink } from "@studio/actions/createSharedLink";
import { useShareLink } from "@studio/hooks/useShareLink";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";

export const usePublicLinkSharing = () => {
	const { getURL } = useShareLink();
	const [isCreating, setIsCreating] = useState(false);

	const getShareLink = useCallback(async () => {
		const url = getURL();

		if (url === null) {
			toast.error(
				"There was an error creating a short link. Please try again later.",
			);
			return;
		}

		setIsCreating(true);

		const shortURL = await createSharedLink("studio", { url: url.toString() });

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
