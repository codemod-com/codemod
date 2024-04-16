import { Backspace as BackspaceIcon } from "@phosphor-icons/react/dist/csr/Backspace";
import { Link as LinkIcon } from "@phosphor-icons/react/dist/csr/Link";
import { Button } from "~/components/ui/button";
import { usePublicLinkSharing } from "~/pageComponents/main/usePublicLinkSharing";
import { useModStore } from "~/store/zustand/mod";
import { useSnippetStore } from "~/store/zustand/snippets";

type ButtonProps = {
	text: string;
	hintText: string;
	disabled: boolean;
};

export const HeaderButtons = () => {
	const { setInput, setOutput } = useSnippetStore();
	const { setContent } = useModStore();
	const { isCreating: isShareURLBeingCreated } = usePublicLinkSharing();
	const { getShareLink } = usePublicLinkSharing();

	const buttonsData = [
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

	return (
		<>
			{buttonsData.map(({ Icon, hintText, ...button }) => (
				<Button
					size="xs"
					variant="outline"
					className="flex gap-1"
					hint={<p className="font-normal">{hintText}</p>}
					{...button}
				>
					{Icon && <Icon className="h-4 w-4" />}
					{button.text}
				</Button>
			))}
		</>
	);
};
