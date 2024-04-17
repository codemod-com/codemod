export type {};
// import { Export as ExportIcon } from "@phosphor-icons/react";
// import { Loader2 } from "lucide-react";
// import { type MouseEvent, useState } from "react";
// import Tooltip from "@studio/components/Tooltip/Tooltip";
// import { useShareLink } from "@studio/hooks/useShareLink";
// import { useModStore } from "@studio/store/zustand/mod";
// import { useSnippetStore } from "@studio/store/zustand/snippets";
// import { assertsNeitherNullNorUndefined } from "../../utils/assertsNeitherNullNorUndefined";
// import { openLink } from "../../utils/openLink";
// import { Button } from "../ui/button";

// type Props = {
// 	className?: string;
// };

// export const ExportButton = ({ className }: Props) => {
// 	const [isCreating, setIsCreating] = useState(false);
// 	const modStore = useModStore();
// 	const { engine } = useSnippetStore();
// 	const { getExtensionUrl } = useShareLink();

// 	assertsNeitherNullNorUndefined(modStore);

// 	if (engine !== "jscodeshift") {
// 		return null;
// 	}

// 	const onClick = async (event: MouseEvent<HTMLButtonElement>) => {
// 		setIsCreating(true);
// 		event.preventDefault();

// 		const url = await getExtensionUrl();

// 		if (url === null) {
// 			setIsCreating(false);
// 			return;
// 		}

// 		const vscodeUrl = new URL("vscode://codemod.codemod-vscode-extension/");
// 		vscodeUrl.search = url.search;

// 		setIsCreating(false);
// 		openLink(vscodeUrl.toString());
// 	};

// 	return (
// 		<Tooltip
// 			trigger={
// 				<Button
// 					className={className}
// 					disabled={modStore.internalContent === "" || isCreating}
// 					onClick={onClick}
// 					id="export-button"
// 					size="sm"
// 					variant="outline"
// 				>
// 					{isCreating ? (
// 						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
// 					) : (
// 						<ExportIcon className="mr-2 h-4 w-4" />
// 					)}
// 					Export to VSCode
// 				</Button>
// 			}
// 			content={
// 				<p className="font-normal">
// 					Run the codemod via Codemod VS Code Extension
// 				</p>
// 			}
// 		/>
// 	);
// };
