import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import { createSharedLink } from "~/actions/createSharedLink";
import { useShareLink } from "~/hooks/useShareLink";

export const usePublicLinkSharing = () => {
	const { getURL } = useShareLink();
	const [isCreating, setIsCreating] = useState(false);

	const getShareLink = useCallback(async () => {
		setIsCreating(true);

		const url = await getURL();

		if (url === null) {
			return;
		}

		const shortURL = await createSharedLink({ url: url.toString() });

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
