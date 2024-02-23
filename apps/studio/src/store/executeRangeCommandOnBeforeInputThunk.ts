import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '~/store';
import { extractIdsAndTypes, type RangeCommand } from '~/utils/tree';
import {
	nodeHasValues,
	setNodeSelectorTreeState,
	type TreeNodeSelectorState,
} from './slices/CFS';
import { selectFirstTreeNode, setInputSelection } from './slices/snippets';

// TODO fix import
const states = {
	VALUE: 'Value',
	TYPE: 'Type',
	UNSELECTED: 'Unselected',
} as const;

export const executeRangeCommandOnBeforeInputThunk = createAsyncThunk<
	void,
	{
		range: RangeCommand;
		name: string;
	},
	{
		dispatch: AppDispatch;
		state: RootState;
	}
>(
	'thunks/executeRangeCommandOnBeforeInputThunk',
	async ({ range, name }, thunkAPI) => {
		const { dispatch, getState } = thunkAPI;

		dispatch(
			setInputSelection({
				name,
				range,
			}),
		);

		const firstTreeNode = selectFirstTreeNode('before', name)(getState());

		if (firstTreeNode === null) {
			return;
		}

		const ids = extractIdsAndTypes(firstTreeNode);
		const map: Record<string, TreeNodeSelectorState> = {};

		ids.forEach(([id, type]) => {
			if (nodeHasValues(type)) {
				map[id] = states.VALUE;
				return;
			}

			map[id] = states.TYPE;
		});

		dispatch(setNodeSelectorTreeState(map));
	},
);
