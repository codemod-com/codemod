import { Backspace as BackspaceIcon } from '@phosphor-icons/react';
import { useDispatch, useSelector } from 'react-redux';
import Tooltip from '~/components/Tooltip/Tooltip';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import { setContent } from '~/store/slices/mod';
import { setInput, setOutput } from '~/store/slices/snippets';
import { selectActiveSnippet } from '~/store/slices/view';

type Props = { className?: string };

const ClearInputButton = ({ className }: Props) => {
	const activeSnippet = useSelector(selectActiveSnippet);
	const dispatch = useDispatch();
	return (
		<Tooltip
			trigger={
				<Button
					className={cn(
						'flex items-center justify-center',
						className,
					)}
					onClick={() => {
						dispatch(
							setInput({
								name: activeSnippet,
								snippetContent: '',
							}),
						);
						dispatch(
							setOutput({
								name: activeSnippet,
								snippetContent: '',
							}),
						);
						dispatch(setContent(''));
					}}
					size="sm"
					variant="outline"
				>
					<BackspaceIcon className="h-4 w-4" />
					<span className="sr-only">Clear Inputs</span>
				</Button>
			}
			content={<p className="font-normal">Clear all inputs</p>}
		/>
	);
};

export default ClearInputButton;
