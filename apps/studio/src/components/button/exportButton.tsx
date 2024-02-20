import { Export as ExportIcon } from "@phosphor-icons/react";
import { Loader2 } from "lucide-react";
import { useState, type MouseEvent } from "react";
import { useSelector } from "react-redux";
import Tooltip from "~/components/Tooltip/Tooltip";
import { useShareLink } from "~/hooks/useShareLink";
import { selectEngine } from "~/store/slices/snippets";
import { selectMod } from "../../store/slices/mod";
import { assertsNeitherNullNorUndefined } from "../../utils/assertsNeitherNullNorUndefined";
import { openLink } from "../../utils/openLink";
import { Button } from "../ui/button";

type Props = {
	className?: string;
};

export const ExportButton = ({ className }: Props) => {
	const [isCreating, setIsCreating] = useState(false);
	const modContext = useSelector(selectMod);
	const engine = useSelector(selectEngine);
	const { getExtensionUrl } = useShareLink();

	assertsNeitherNullNorUndefined(modContext);

	if (engine === "tsmorph") {
		return null;
	}

	const onClick = async (event: MouseEvent<HTMLButtonElement>) => {
		setIsCreating(true);
		event.preventDefault();

		const url = await getExtensionUrl();

		if (url === null) {
			setIsCreating(false);
			return;
		}

		const vscodeUrl = new URL("vscode://codemod.codemod-vscode-extension/");
		vscodeUrl.search = url.search;

		setIsCreating(false);
		openLink(vscodeUrl.toString());
	};

	return (
		<Tooltip
			trigger={
				<Button
					className={className}
					disabled={modContext.internalContent === "" || isCreating}
					onClick={onClick}
					id="export-button"
					size="sm"
					variant="outline"
				>
					{isCreating ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						<ExportIcon className="mr-2 h-4 w-4" />
					)}
					Export to VSCode
				</Button>
			}
			content={
				<p className="font-normal">
					Run the codemod via Codemod VS Code Extension
				</p>
			}
		/>
	);
};
