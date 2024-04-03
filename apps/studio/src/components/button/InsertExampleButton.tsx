import { useDispatch, useSelector } from "react-redux";
import Tooltip from "~/components/Tooltip/Tooltip";
import { Button } from "~/components/ui/button";
import { ExampleIcon } from "~/icons/Example";
import {
	AFTER_SNIPPET_DEFAULT_CODE,
	BEFORE_SNIPPET_DEFAULT_CODE,
	buildDefaultCodemodSource,
} from "~/store/getInitialState";
import { setContent } from "~/store/slices/mod";
import { selectEngine, setInput, setOutput } from "~/store/slices/snippets";

const InsertExampleButton = () => {
	const engine = useSelector(selectEngine);
	const dispatch = useDispatch();
	return (
		<Tooltip
			trigger={
				<Button
					className="flex items-center justify-center px-0"
					onClick={() => {
						dispatch(setInput(BEFORE_SNIPPET_DEFAULT_CODE));
						dispatch(setOutput(AFTER_SNIPPET_DEFAULT_CODE));
						dispatch(setContent(buildDefaultCodemodSource(engine)));
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
