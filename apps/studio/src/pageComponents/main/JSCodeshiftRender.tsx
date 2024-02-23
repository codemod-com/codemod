import dynamic from "next/dynamic";
import { useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { useWebWorker } from "~/hooks/useWebWorker";
import { type OffsetRange } from "~/schemata/offsetRangeSchemata";
import { useAppDispatch } from "~/store";
import { setRangeThunk } from "~/store/setRangeThunk";
import {
	codemodOutputSlice,
	selectCodemodOutput,
} from "~/store/slices/codemodOutput";
import Text from "../../components/Text";
import { Button } from "../../components/ui/button";
import { setActiveEventThunk } from "../../store/setActiveEventThunk";
import { selectLog, setEvents } from "../../store/slices/log";
import { selectMod, setHasRuntimeErrors } from "../../store/slices/mod";
import { selectSnippets } from "../../store/slices/snippets";
import { TabNames, viewSlice } from "../../store/slices/view";
import { useSnippet } from "./SnippetUI";

const MonacoDiffEditor = dynamic(
	() => import("../../components/Snippet/MonacoDiffEditor"),
	{
		loading: () => <p>Loading...</p>,
		ssr: false,
	},
);

const LiveCodemodResult = () => {
	const { engine, inputSnippet, afterInputRanges } =
		useSelector(selectSnippets);

	const { internalContent } = useSelector(selectMod);
	const { events } = useSelector(selectLog);
	const [webWorkerState, postMessage] = useWebWorker();

	const codemodOutput = useSelector(selectCodemodOutput);
	const dispatch = useAppDispatch();

	const { value, handleSelectionChange, onSnippetChange } = useSnippet("after");

	const content = internalContent ?? "";

	const snippetBeforeHasOnlyWhitespaces = !/\S/.test(inputSnippet);
	const codemodSourceHasOnlyWhitespaces = !/\S/.test(content);

	const firstCodemodExecutionErrorEvent = events.find(
		(e) => e.kind === "codemodExecutionError",
	);

	useEffect(() => {
		if (snippetBeforeHasOnlyWhitespaces || codemodSourceHasOnlyWhitespaces) {
			dispatch(codemodOutputSlice.actions.setContent(""));
			dispatch(setHasRuntimeErrors(false));
			dispatch(setEvents([]));

			return;
		}

		postMessage(engine, content, inputSnippet);
	}, [
		engine,
		inputSnippet,
		content,
		dispatch,
		snippetBeforeHasOnlyWhitespaces,
		codemodSourceHasOnlyWhitespaces,
		postMessage,
	]);

	useEffect(() => {
		if (webWorkerState.kind === "LEFT") {
			dispatch(
				codemodOutputSlice.actions.setContent(webWorkerState.error.message),
			);
			dispatch(setHasRuntimeErrors(true));
			dispatch(setEvents([]));
			return;
		}

		dispatch(
			codemodOutputSlice.actions.setContent(webWorkerState.output ?? ""),
		);

		dispatch(setHasRuntimeErrors(false));
		dispatch(setEvents(webWorkerState.events));
	}, [dispatch, webWorkerState]);

	const onSelectionChange = useCallback(
		(range: OffsetRange) => {
			dispatch(
				setRangeThunk({
					target: "CODEMOD_OUTPUT",
					ranges: [range],
				}),
			);
		},
		[dispatch],
	);

	return (
		<div className="relative flex h-full w-full flex-col">
			<div className="relative flex h-full w-full flex-col">
				<div className="text-center">
					{snippetBeforeHasOnlyWhitespaces && (
						<Text>
							Please provide the snippet before the transformation to execute
							the codemod.
						</Text>
					)}
					{codemodSourceHasOnlyWhitespaces && (
						<Text>Please provide the codemod to execute it.</Text>
					)}
					{firstCodemodExecutionErrorEvent !== undefined ? (
						<Text>
							Codemod has execution error(s). Please, check the
							<Button
								variant="link"
								className="text-md -ml-1 pt-3 font-light text-gray-500 dark:text-gray-300"
								onClick={() => {
									dispatch(
										setActiveEventThunk(
											firstCodemodExecutionErrorEvent.hashDigest,
										),
									);
									dispatch(viewSlice.actions.setActiveTab(TabNames.DEBUG));
								}}
							>
								Debugger
							</Button>
							to get more info.
						</Text>
					) : null}
				</div>
				<MonacoDiffEditor
					originalModelPath="original.tsx"
					modifiedModelPath="modified.tsx"
					options={{
						readOnly: true,
						originalEditable: true,
					}}
					originalEditorProps={{
						highlights: afterInputRanges,
						onSelectionChange: handleSelectionChange,
						onChange: onSnippetChange,
						value,
					}}
					modifiedEditorProps={{
						highlights: codemodOutput.ranges,
						onSelectionChange,
						value: codemodOutput.content ?? "",
					}}
				/>
			</div>
		</div>
	);
};

export default LiveCodemodResult;
