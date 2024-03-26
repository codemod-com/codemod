import dynamic from "next/dynamic";
import { PropsWithChildren, ReactNode, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import {
	BoundResizePanel,
	PanelData,
	PanelRefs,
	SnippetHeader,
	SnippetType,
} from "src/pageComponents/main/PageBottomPane";
import { useWebWorker } from "~/hooks/useWebWorker";
import { cn } from "~/lib/utils";
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

export const useCodeDiff = () => {
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

	const onDebug = () => {
		firstCodemodExecutionErrorEvent?.hashDigest &&
			dispatch(setActiveEventThunk(firstCodemodExecutionErrorEvent.hashDigest));
		dispatch(viewSlice.actions.setActiveTab(TabNames.DEBUG));
	};

	const originalEditorProps = {
		highlights: afterInputRanges,
		onSelectionChange: handleSelectionChange,
		onChange: onSnippetChange,
		value,
	};

	const modifiedEditorProps = {
		highlights: codemodOutput.ranges,
		onSelectionChange,
		value: codemodOutput.content ?? "",
	};

	return {
		codemodSourceHasOnlyWhitespaces,
		snippetBeforeHasOnlyWhitespaces,
		firstCodemodExecutionErrorEvent,
		onDebug,
		originalEditorProps,
		modifiedEditorProps,
	};
};

export type WarningTextsProps = Pick<
	ReturnType<typeof useCodeDiff>,
	| "snippetBeforeHasOnlyWhitespaces"
	| "firstCodemodExecutionErrorEvent"
	| "onDebug"
	| "codemodSourceHasOnlyWhitespaces"
>;

export type LiveCodemodResultProps = Pick<
	ReturnType<typeof useCodeDiff>,
	"originalEditorProps" | "modifiedEditorProps"
>;
export const WarningTexts = ({
	snippetBeforeHasOnlyWhitespaces,
	firstCodemodExecutionErrorEvent,
	onDebug,
	codemodSourceHasOnlyWhitespaces,
}: WarningTextsProps) => {
	return (
		<div className="text-center">
			{snippetBeforeHasOnlyWhitespaces && (
				<Text>
					Please provide the snippet before the transformation to execute the
					codemod.
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
						onClick={onDebug}
					>
						Debugger
					</Button>
					to get more info.
				</Text>
			) : null}
		</div>
	);
};

export const DiffEditorWrapper = ({
	originalEditorProps,
	modifiedEditorProps,
	warnings,
	type,
}: Pick<LiveCodemodResultProps, "originalEditorProps" | "modifiedEditorProps"> &
	PropsWithChildren<{
		warnings?: ReactNode;
		type: SnippetType;
	}>) => (
	<div
		className={cn(
			"relative flex h-full flex-col",
			type === "after" ? "w-[200%] mr-[-50%]" : "w-full",
			`${type}-shown`,
		)}
	>
		<div className="relative flex h-full w-full flex-col">
			{warnings}
			<MonacoDiffEditor
				renderSideBySide={type === "after"}
				originalModelPath="original.tsx"
				modifiedModelPath="modified.tsx"
				options={{
					readOnly: true,
					originalEditable: true,
				}}
				loading={false}
				originalEditorProps={originalEditorProps}
				modifiedEditorProps={modifiedEditorProps}
			/>
		</div>
	</div>
);

const CodeSnippedPanel = ({
	children,
	header,
	className,
	panelData,
	panelRefs,
}: PropsWithChildren<{
	className?: string;
	header: string;
	panelRefs: PanelRefs;
	panelData: PanelData;
}>) => {
	return (
		<BoundResizePanel
			className={cn(
				"visibilityOptions" in panelData && "collapsable_panel",
				className,
			)}
			defaultSize={33}
			panelRefIndex={panelData.snippedIndex}
			panelRefs={panelRefs}
		>
			<SnippetHeader
				visibilityOptions={panelData.visibilityOptions}
				title={header}
			/>
			{children}
		</BoundResizePanel>
	);
};

export default CodeSnippedPanel;
