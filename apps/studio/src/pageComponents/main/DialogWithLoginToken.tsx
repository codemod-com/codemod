import { useAuth } from "@clerk/clerk-react";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import getAccessToken from "~/api/getAccessToken";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import { CopyTerminalCommands } from "./DownloadZip";

type Props = {
	isOpen: boolean;
	setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export const DialogWithLoginToken = ({ isOpen, setIsOpen }: Props) => {
	const { getToken } = useAuth();
	const [accessToken, setAccessToken] = useState<string | null>(null);

	useEffect(() => {
		if (!isOpen) {
			return;
		}
		(async () => {
			const clerkToken = await getToken();
			if (clerkToken === null) {
				return;
			}
			const accessTokenEither = await getAccessToken({
				clerkToken,
			});

			if (accessTokenEither.isLeft()) {
				console.error(accessTokenEither.getLeft());
				return;
			}
			const token = accessTokenEither.get();
			setAccessToken(token);
		})();
	}, [isOpen, getToken]);

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				setIsOpen(open);
				setAccessToken(null);
			}}
		>
			<DialogContent className="max-w-2xl">
				{accessToken !== null ? (
					<>
						<p>Copy and paste the following command into CLI.</p>
						<CopyTerminalCommands
							text={`codemod login --token "${accessToken}"`}
						/>
					</>
				) : (
					<p>Please wait until we have generated the access token.</p>
				)}
			</DialogContent>
		</Dialog>
	);
};
