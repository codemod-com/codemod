import * as S from "@effect/schema/Schema";
import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import { useShareLink } from "~/hooks/useShareLink";

const responseSchema = S.struct({
	shortURL: S.string,
});

const parseResponse = S.parseSync(responseSchema);

export const usePublicLinkSharing = () => {
	const { getURL } = useShareLink();
	const [isCreating, setIsCreating] = useState(false);

	const getShareLink = useCallback(async () => {
		setIsCreating(true);

		try {
			const url = await getURL();

			if (url === null) {
				return;
			}

			// based on https://developers.short.io/docs/creating-short-links-from-javascript#1-get-your-public-api-key-here-httpsappshortiosettingsintegrationsapi-key
			// take into account that we pass the public key
			// because we want unlogged users to create links as well

			const data = {
				domain: "go.intuita.io",
				originalURL: url.toString(),
			};

			const response = await fetch("https://api.short.io/links/public", {
				method: "post",
				headers: {
					accept: "application/json",
					"Content-Type": "application/json",
					authorization: "pk_IWp4WTezk4Dgb5bc",
				},
				body: JSON.stringify(data),
			});

			const json = await response.json();

			const { shortURL } = parseResponse(json);

			navigator.clipboard.writeText(shortURL);
			toast.success("Copied the shared link into the clipboard");
		} catch (error) {
			console.error(error);
		}
		setIsCreating(false);
	}, [getURL]);

	return {
		getShareLink,
		isCreating,
	};
};

// export const PublicLinkSharingButton = () => {
// 	const { getURL } = useShareLink();
// 	const [isCreating, setIsCreating] = useState(false);

// 	const onClick: MouseEventHandler<HTMLButtonElement> = useCallback(
// 		async (event) => {
// 			setIsCreating(true);
// 			event.preventDefault();

// 			try {
// 				const url = await getURL();

// 				if (url === null) {
// 					return;
// 				}

// 				// based on https://developers.short.io/docs/creating-short-links-from-javascript#1-get-your-public-api-key-here-httpsappshortiosettingsintegrationsapi-key
// 				// take into account that we pass the public key
// 				// because we want unlogged users to create links as well

// 				const data = {
// 					domain: "go.intuita.io",
// 					originalURL: url.toString(),
// 				};

// 				const response = await fetch("https://api.short.io/links/public", {
// 					method: "post",
// 					headers: {
// 						accept: "application/json",
// 						"Content-Type": "application/json",
// 						authorization: "pk_IWp4WTezk4Dgb5bc",
// 					},
// 					body: JSON.stringify(data),
// 				});

// 				const json = await response.json();

// 				const { shortURL } = parseResponse(json);

// 				navigator.clipboard.writeText(shortURL);
// 				toast.success("Copied the shared link into the clipboard");
// 			} catch (error) {
// 				console.error(error);
// 			}
// 			setIsCreating(false);
// 		},
// 		[getURL],
// 	);

// 	return (
// 		<Button
// 			className="w-44"
// 			onClick={onClick}
// 			size="sm"
// 			variant="outline"
// 			disabled={isCreating}
// 		>
// 			{isCreating ? (
// 				<Loader2 className="mr-2 h-4 w-4 animate-spin " />
// 			) : (
// 				<LinkIcon className="mr-2 h-4 w-4" alt="Link" />
// 			)}
// 			Copy Share Link
// 		</Button>
// 	);
// };
