import { Backspace as BackspaceIcon } from "@phosphor-icons/react/dist/csr/Backspace";
import { Check as CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { Link as LinkIcon } from "@phosphor-icons/react/dist/csr/Link";
import { usePublicLinkSharing } from "~/pageComponents/main/usePublicLinkSharing";
import { useModStore } from "~/store/zustand/mod";
import { useSnippetStore } from "~/store/zustand/snippets";

export const useButtons = (
	ensureSignIn: VoidFunction,
	isCodemodRunIdle: boolean,
	isCodemodSourceSet: boolean,
) => {
	const { setInput, setOutput } = useSnippetStore();
	const { setContent } = useModStore();
	const { isCreating: isShareURLBeingCreated } = usePublicLinkSharing();
	const { getShareLink } = usePublicLinkSharing();
	return [
		{
			hintText: !isCodemodRunIdle
				? "Codemod is already executing"
				: !isCodemodSourceSet
				  ? "Specify the codemod source"
				  : "Run Codemod on branch",
			onClick: ensureSignIn,
			Icon: CheckIcon,
			text: "Run on branch",
			disabled: !isCodemodRunIdle || !isCodemodSourceSet,
		},
		{
			hintText: "Clear all inputs",
			onClick: () => {
				setInput("");
				setOutput("");
				setContent("");
			},
			Icon: BackspaceIcon,
			text: "Clear all inputs",
		},
		{
			hintText: "Share the codemod",
			onClick: getShareLink,
			Icon: isShareURLBeingCreated ? LinkIcon : null,
			text: "Share",
			/* FIXME: refactor button component to replace loading icon with the button's icon */
			props: { isLoading: isShareURLBeingCreated },
		},
	];
};
