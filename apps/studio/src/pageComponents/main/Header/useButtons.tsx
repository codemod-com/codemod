import { Backspace as BackspaceIcon } from "@phosphor-icons/react/dist/csr/Backspace";
import { Check as CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { Link as LinkIcon } from "@phosphor-icons/react/dist/csr/Link";
import { GetExecutionStatusResponse } from "~/api/getExecutionStatus";
import { usePublicLinkSharing } from "~/pageComponents/main/usePublicLinkSharing";
import { useModStore } from "~/store/zustand/mod";
import { useSnippetStore } from "~/store/zustand/snippets";

type Status = GetExecutionStatusResponse["status"];

type ButtonProps = {
	text: string;
	hintText: string;
	disabled: boolean;
};

const getButtonPropsByStatus = (status: Status): Partial<ButtonProps> => {
	switch (status) {
		case "done":
		case "idle": {
			return {
				text: "Run on branch",
				hintText: "Run Codemod on branch",
			};
		}
		case "progress": {
			return {
				text: "Stop",
				hintText: "Terminate current codemod run",
			};
		}
		default: {
			return {
				text: "Run on branch",
				hintText: "Run Codemod on branch",
			};
		}
	}
};

export const useButtons = (
	ensureSignIn: VoidFunction,
	codemodRunStatus: GetExecutionStatusResponse["status"],
) => {
	const { setInput, setOutput } = useSnippetStore();
	const { setContent } = useModStore();
	const { isCreating: isShareURLBeingCreated } = usePublicLinkSharing();
	const { getShareLink } = usePublicLinkSharing();

	const props = getButtonPropsByStatus(codemodRunStatus);

	return [
		{
			onClick: ensureSignIn,
			Icon: CheckIcon,
			disabled: false,
			...props,
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
