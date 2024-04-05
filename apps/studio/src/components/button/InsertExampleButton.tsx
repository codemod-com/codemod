import Tooltip from "~/components/Tooltip/Tooltip";
import { Button } from "~/components/ui/button";
import { ExampleIcon } from "~/icons/Example";
import { useModStore } from "~/zustand/stores/mod";
import { useSnippetStore } from "~/zustand/stores/snippets";
import {
	AFTER_SNIPPET_DEFAULT_CODE,
	BEFORE_SNIPPET_DEFAULT_CODE,
	buildDefaultCodemodSource,
} from "~/zustand/utils/getInitialState";

const InsertExampleButton = () => {
	const { engine, setBeforeSnippetText, setAfterSnippetText } =
		useSnippetStore();
	const { setContent } = useModStore();
	return (
		<Tooltip
			trigger={
				<Button
					className="flex items-center justify-center px-0"
					onClick={() => {
						setBeforeSnippetText(BEFORE_SNIPPET_DEFAULT_CODE);
						setAfterSnippetText(AFTER_SNIPPET_DEFAULT_CODE);
						setContent(buildDefaultCodemodSource(engine));
					}}
					size="xs"
					variant="ghost"
				>
					{/* <KeyboardIcon className="h-4 w-4" /> */}
					<ExampleIcon />
					<span className="sr-only">Insert Example</span>
				</Button>
			}
			content={<p className="font-normal">Insert an example</p>}
		/>
	);
};

export default InsertExampleButton;
