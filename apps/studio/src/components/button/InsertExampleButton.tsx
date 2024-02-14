import { Keyboard as KeyboardIcon } from '@phosphor-icons/react';
import { useDispatch, useSelector } from 'react-redux';
import Tooltip from '~/components/Tooltip/Tooltip';
import { Button } from '~/components/ui/button';
import {
	AFTER_SNIPPET_DEFAULT_CODE,
	BEFORE_SNIPPET_DEFAULT_CODE,
	buildDefaultCodemodSource,
} from '~/store/getInitialState';
import { setContent } from '~/store/slices/mod';
import { selectEngine, setInput, setOutput } from '~/store/slices/snippets';

const InsertExampleButton = () => {
	const engine = useSelector(selectEngine);
	const dispatch = useDispatch();
	return (
		<Tooltip
			trigger={
				<Button
					className="flex items-center justify-center"
					onClick={() => {
						dispatch(setInput(BEFORE_SNIPPET_DEFAULT_CODE));
						dispatch(setOutput(AFTER_SNIPPET_DEFAULT_CODE));
						dispatch(setContent(buildDefaultCodemodSource(engine)));
					}}
					size="sm"
					variant="outline"
				>
					<KeyboardIcon className="h-4 w-4" />
					<span className="sr-only">Insert Example</span>
				</Button>
			}
			content={<p className="font-normal">Insert an example</p>}
		/>
	);
};

export default InsertExampleButton;
