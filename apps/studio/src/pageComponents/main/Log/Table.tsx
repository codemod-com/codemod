import {
	memo,
	useCallback,
	useMemo,
	useState,
	type MouseEventHandler,
} from 'react';
import { useSelector } from 'react-redux';
import { Label } from '~/components/ui/label';
import {
	Table as ShadCNTable,
	TableRow as ShadCNTableRow,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
} from '~/components/ui/table';
import { cn } from '~/lib/utils';
import { useAppDispatch, useAppStore, type RootState } from '~/store';
import { executeRangeCommandOnBeforeInputThunk } from '~/store/executeRangeCommandOnBeforeInputThunk';
import { setActiveEventThunk } from '~/store/setActiveEventThunk';
import { codemodOutputSlice } from '~/store/slices/codemodOutput';
import { setCodemodSelection } from '~/store/slices/mod';
import {
	selectIndividualSnippet,
	setOutputSelection,
} from '~/store/slices/snippets';
import { selectActiveSnippet } from '~/store/slices/view';
import { selectLog, type Event } from '../../../store/slices/log';

type TableRow = Readonly<{
	index: number;
	hashDigest: string;
	className: string;
	name: string;
	details: ReadonlyArray<string>;
}>;

const getTableRowName = (event: Event): string => {
	switch (event.kind) {
		case 'collectionFind':
			return 'Found Collection';
		case 'collectionPaths':
			return 'Found Paths';
		case 'collectionRemove':
			return 'Removed Collection';
		case 'collectionReplace':
			return 'Replaced Collection';
		case 'collectionToSource':
			return 'Built Source from Collection';
		case 'path': {
			if (event.mode === 'lookup') {
				return 'Accessed Path(s)';
			}
			return 'Replaced Path(s)';
		}
		case 'pathReplace':
			return 'Replaced Path(s)';
		case 'jscodeshiftApplyString':
			return 'Created Root Collection';
		case 'printedMessage':
			return 'Printed Message';
		case 'codemodExecutionError':
			return 'Codemod Execution Error';
		default:
			return 'Unknown Event';
	}
};

const getTableRowDetails = (event: Event) => {
	const res: string[] = [];

	if ('nodeType' in event) {
		res.push(`Node Type: ${event.nodeType}`);
	}

	if ('snippetBeforeRanges' in event) {
		res.push(`Node Count: ${event.snippetBeforeRanges.length}`);
	}

	if ('message' in event) {
		res.push(`Message: ${event.message}`);
	}

	return res;
};

const buildTableRow = (
	event: Event,
	eventHashDigest: string | null,
	index: number,
): TableRow => ({
	index,
	hashDigest: event.hashDigest,
	className: event.hashDigest === eventHashDigest ? 'highlight' : '',
	name: getTableRowName(event),
	details: getTableRowDetails(event),
});

const getRanges = (state: RootState, name: string) => {
	const currentSnippet = selectIndividualSnippet(name)(state);

	if (!currentSnippet) {
		throw new Error('Snippet not found');
	}

	return {
		codemodInputRanges: state.mod.ranges,
		codemodOutputRanges: state.codemodOutput.ranges,
		beforeInputRanges: currentSnippet.beforeInputRanges,
		afterInputRanges: currentSnippet.afterInputRanges,
	};
};

type Ranges = ReturnType<typeof getRanges>;

const Table = () => {
	const activeSnippet = useSelector(selectActiveSnippet);
	const store = useAppStore();
	const { activeEventHashDigest, events } = useSelector(selectLog);
	const [oldEventHashDigest, setOldEventHashDigest] = useState<string | null>(
		null,
	);
	const [oldRanges, setOldRanges] = useState<Ranges | null>(null);

	const dispatch = useAppDispatch();

	const buildOnMouseOver = useCallback(
		(hashDigest: string): MouseEventHandler<HTMLTableRowElement> =>
			(event) => {
				event.preventDefault();

				dispatch(setActiveEventThunk(hashDigest));
			},
		[dispatch],
	);

	const buildOnClick = useCallback(
		(hashDigest: string): MouseEventHandler<HTMLTableRowElement> =>
			async (event) => {
				event.preventDefault();

				await dispatch(setActiveEventThunk(hashDigest));

				setOldRanges(getRanges(store.getState(), activeSnippet));
				setOldEventHashDigest(hashDigest);
			},
		[activeSnippet, dispatch, store],
	);

	const onMouseEnter: MouseEventHandler<HTMLTableElement> = useCallback(
		(event) => {
			event.preventDefault();

			setOldRanges(getRanges(store.getState(), activeSnippet));
			setOldEventHashDigest(activeEventHashDigest);
		},
		[activeEventHashDigest, activeSnippet, store],
	);

	const onMouseLeave: MouseEventHandler<HTMLTableElement> = useCallback(
		(event) => {
			event.preventDefault();

			dispatch(setActiveEventThunk(oldEventHashDigest));

			if (oldRanges === null) {
				return;
			}

			dispatch(
				setCodemodSelection({
					kind: 'PASS_THROUGH',
					ranges: oldRanges.codemodInputRanges,
				}),
			);
			dispatch(
				codemodOutputSlice.actions.setSelections({
					kind: 'PASS_THROUGH',
					ranges: oldRanges.codemodOutputRanges,
				}),
			);
			dispatch(
				executeRangeCommandOnBeforeInputThunk({
					name: activeSnippet,
					range: {
						kind: 'PASS_THROUGH',
						ranges: oldRanges.beforeInputRanges,
					},
				}),
			);
			dispatch(
				setOutputSelection({
					name: activeSnippet,
					range: {
						kind: 'PASS_THROUGH',
						ranges: oldRanges.afterInputRanges,
					},
				}),
			);
		},
		[activeSnippet, dispatch, oldEventHashDigest, oldRanges],
	);

	const tableRows = useMemo(
		() =>
			events.map((event, index) =>
				buildTableRow(event, activeEventHashDigest, index),
			),
		[events, activeEventHashDigest],
	);

	return (
		<div className="align-center flex justify-center">
			{tableRows.length !== 0 ? (
				<ShadCNTable
					className="w-full table-fixed text-left text-sm font-light text-black dark:text-white"
					onMouseEnter={onMouseEnter}
					onMouseLeave={onMouseLeave}
				>
					<TableHeader>
						<ShadCNTableRow>
							<TableHead className="w-[5rem]">Nº</TableHead>
							<TableHead>Event</TableHead>
							<TableHead>Details</TableHead>
						</ShadCNTableRow>
					</TableHeader>
					<TableBody>
						{tableRows.map(
							({
								className,
								name,
								details,
								index,
								hashDigest,
							}) => (
								<ShadCNTableRow
									className={cn(
										className,
										'border',
										'cursor-pointer',
									)}
									key={hashDigest}
									onMouseOver={buildOnMouseOver(hashDigest)}
									onClick={buildOnClick(hashDigest)}
								>
									<TableCell className="font-medium">
										{index}
									</TableCell>
									<TableCell>{name}</TableCell>
									<TableCell>
										{details.map((detail) => (
											<p key={detail}>{detail}</p>
										))}
									</TableCell>
								</ShadCNTableRow>
							),
						)}
					</TableBody>
				</ShadCNTable>
			) : (
				<Label className="text-center text-lg font-light">
					No results have been found
				</Label>
			)}
		</div>
	);
};

export default memo(Table);
