import Tooltip from "@studio/components/Tooltip/Tooltip";
import { Button } from "@studio/components/ui/button";
import { ExampleIcon } from "@studio/icons/Example";
import {
	AFTER_SNIPPET_DEFAULT_CODE,
	BEFORE_SNIPPET_DEFAULT_CODE,
	buildDefaultCodemodSource,
} from "@studio/store/getInitialState";
import { useModStore } from "@studio/store/zustand/mod";
import { useSnippetStore } from "@studio/store/zustand/snippets";

const InsertExampleButton = () => {
	const { engine, setInput, setOutput } = useSnippetStore();
	const { setContent } = useModStore();
	return (
		<Tooltip
			trigger={
				<Button
					className="flex items-center justify-center px-0"
					onClick={() => {
						setInput(BEFORE_SNIPPET_DEFAULT_CODE);
						setOutput(AFTER_SNIPPET_DEFAULT_CODE);
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
