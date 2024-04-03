import dynamic from "next/dynamic";
import { PropsWithChildren, ReactNode, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import {
	BoundResizePanel,
	PanelData,
	PanelsRefs,
	SnippetHeader,
	SnippetType,
} from "src/pageComponents/main/PageBottomPane";
import { useWebWorker } from "~/hooks/useWebWorker";
import { cn } from "~/lib/utils";
import { type OffsetRange } from "~/schemata/offsetRangeSchemata";
import { useAppDispatch } from "~/store";
import { setRangeThunk } from "~/store/useRangeStore";
import {
	codemodOutputSlice,
	selectCodemodOutput,
} from "~/store/slices/codemodOutput";
import { useLogStore } from "~/store/zustand/log";
import { TabNames, useViewStore } from "~/store/zustand/view";
import { setActiveEventThunk } from "../../store/setActiveEventThunk";
import { selectMod, setHasRuntimeErrors } from "../../store/slices/mod";
import { selectSnippets } from "../../store/slices/snippets";
import { useSnippet } from "./SnippetUI";

const MonacoDiffEditor = dynamic(
	() => import("../../components/Snippet/MonacoDiffEditor"),
	{
		loading: () => <p>Loading...</p>,
		ssr: false,
	},
);

export const useCodeDiff = () => {
	const { setEvents, events } = useLogStore();
	const { engine, inputSnippet, afterInputRanges } =
		useSelector(selectSnippets);

	const { internalContent } = useSelector(selectMod);
	const [webWorkerState, postMessage] = useWebWorker();

	const codemodOutput = useSelector(selectCodemodOutput);
	const dispatch = useAppDispatch();

	const { value, handleSelectionChange, onSnippetChange } = useSnippet("after");

	const content = internalContent ?? "";

	const { setActiveTab } = useViewStore();

	const snippetBeforeHasOnlyWhitespaces = !/\S/.test(inputSnippet);
	const codemodSourceHasOnlyWhitespaces = !/\S/.test(content);

	const firstCodemodExecutionErrorEvent = events.find(
		(e) => e.kind === "codemodExecutionError",
	);

	useEffect(() => {
		if (snippetBeforeHasOnlyWhitespaces || codemodSourceHasOnlyWhitespaces) {
			dispatch(codemodOutputSlice.actions.setContent(""));
			dispatch(setHasRuntimeErrors(false));
			setEvents([]);

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
			setEvents([]);
			return;
		}

		dispatch(
			codemodOutputSlice.actions.setContent(webWorkerState.output ?? ""),
		);

		dispatch(setHasRuntimeErrors(false));
		setEvents(webWorkerState.events);
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
		setActiveTab(TabNames.DEBUG);
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

export type LiveCodemodResultProps = Pick<
	ReturnType<typeof useCodeDiff>,
	"originalEditorProps" | "modifiedEditorProps"
>;

export const DiffEditorWrapper = ({
	originalEditorProps,
	modifiedEditorProps,
	type,
}: Pick<LiveCodemodResultProps, "originalEditorProps" | "modifiedEditorProps"> &
	PropsWithChildren<{
		warnings?: ReactNode;
		type: SnippetType;
	}>) => {
	return (
		<div
			className={cn(
				"relative flex h-full flex-col w-[200%]",
				type === "after" ? "mr-[-50%]" : "ml-[-100%]",
				`${type}-shown`,
			)}
		>
			<div className="relative flex h-full w-full flex-col">
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
};

const CodeSnippedPanel = ({
	children,
	header,
	className,
	panelData,
	defaultSize,
	panelRefs,
	warnings,
}: PropsWithChildren<{
	className?: string;
	header: string;
	defaultSize: number;
	panelRefs: PanelsRefs;
	panelData: PanelData;
	warnings?: ReactNode;
}>) => {
	return (
		<BoundResizePanel
			className={cn(
				"visibilityOptions" in panelData && "collapsable_panel",
				className,
			)}
			boundedIndex={panelData.boundIndex}
			defaultSize={defaultSize}
			panelRefIndex={panelData.snippedIndex}
			panelRefs={panelRefs}
		>
			<SnippetHeader
				visibilityOptions={panelData.visibilityOptions}
				title={header}
			/>
			{warnings}
			{children}
		</BoundResizePanel>
	);
};

export default CodeSnippedPanel;
