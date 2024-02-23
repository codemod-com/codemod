import dynamic from 'next/dynamic';
import { useCallback, useRef } from 'react';
import { useSelector, useStore } from 'react-redux';
import { type OffsetRange } from '~/schemata/offsetRangeSchemata';
import { useAppDispatch, useAppStore } from '~/store';
import { setRangeThunk } from '~/store/setRangeThunk';
import { selectActiveSnippet } from '~/store/slices/view';
import {
	selectIndividualSnippet,
	selectSnippetsFor,
	setInput,
	setOutput,
} from '../../store/slices/snippets';
import prettifyDeprecated from '../../utils/prettify';

const CodeSnippet = dynamic(() => import('~/components/Snippet'), {
	loading: () => <p>Loading...</p>,
	ssr: false,
});

type Props = {
	type: 'before' | 'after';
};

export const useSnippet = (type: 'before' | 'after') => {
	const activeSnippet = useSelector(selectActiveSnippet);
	const state = useSelector(selectIndividualSnippet(activeSnippet));
	const store = useAppStore();

	const dispatch = useAppDispatch();

	const valueKey = type === 'before' ? 'inputSnippet' : 'outputSnippet';

	const value = state && state[valueKey] ? state[valueKey] : '';

	const onSnippetChange = useCallback(
		(text?: string) => {
			const activeSnippetName = selectActiveSnippet(store.getState());
			const val = text ?? '';
			dispatch(
				type === 'before'
					? setInput({
							name: activeSnippetName,
							snippetContent: val,
					  })
					: setOutput({
							name: activeSnippetName,
							snippetContent: val,
					  }),
			);
		},

		[dispatch, store, type],
	);

	const onSnippetBlur = useCallback(() => {
		onSnippetChange(prettifyDeprecated(value));
	}, [onSnippetChange, value]);

	const handleSelectionChange = useCallback(
		(range: OffsetRange) => {
			dispatch(
				setRangeThunk({
					target: type === 'before' ? 'BEFORE_INPUT' : 'AFTER_INPUT',
					ranges: [range],
				}),
			);
		},
		[dispatch, type],
	);

	return {
		value,
		onSnippetBlur,
		onSnippetChange,
		handleSelectionChange,
	};
};
const SnippetUI = ({ type }: Props) => {
	const { value, onSnippetBlur, onSnippetChange, handleSelectionChange } =
		useSnippet(type);

	const activeSnippet = useSelector(selectActiveSnippet);
	const { ranges } = useSelector(selectSnippetsFor(type, activeSnippet));

	return (
		<div className="h-full overflow-hidden">
			<div className="h-full grow">
				<CodeSnippet
					highlights={ranges}
					language="typescript"
					onBlur={onSnippetBlur}
					onChange={onSnippetChange}
					onSelectionChange={handleSelectionChange}
					path={`${type}Snippet.tsx`}
					value={value}
				/>
			</div>
		</div>
	);
};

export default SnippetUI;
