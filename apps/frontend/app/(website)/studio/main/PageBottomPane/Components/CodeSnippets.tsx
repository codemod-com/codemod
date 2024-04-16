import type { PropsWithChildren } from "react";
import { PanelGroup } from "react-resizable-panels";
import ResizeHandle from "~/components/ResizePanel/ResizeHandler";
import { cn } from "~/lib/utils";
import CodeSnippedPanel, {
	DiffEditorWrapper,
	type useCodeDiff,
} from "../../JSCodeshiftRender";
import type {
	PanelData,
	PanelsRefs,
} from "../";
import SnippetUI from "../../SnippetUI";
import { isVisible } from "~/utils/visibility";

type CodeSnippetsProps = {
	panels: PanelData[];
	panelRefs: PanelsRefs;
	onlyAfterHidden: boolean;
	codeDiff: ReturnType<typeof useCodeDiff>;
};
export const CodeSnippets = ({
	panels,
	children,
	codeDiff,
	panelRefs,
}: PropsWithChildren<CodeSnippetsProps>) => {
	const snippetPanels = panels.map((panelData, index, arr) => {
		const {
			snippetData: {
				snippet,
				getExtras,
				diffEditorWrapper,
				...codeSnippedPanel
			},
		} = panelData;
		const Snippet = snippet == "regular" ? SnippetUI : DiffEditorWrapper;
		return (
			<>
				<CodeSnippedPanel
					defaultSize={100 / arr.length}
					panelData={panelData}
					className={cn(!isVisible(panelData) && "hidden")}
					panelRefs={panelRefs}
					{...codeSnippedPanel}
				>
					<Snippet
						{...{
							...diffEditorWrapper,
							...codeDiff,
						}}
					/>
				</CodeSnippedPanel>
				{arr.length !== 1 &&
					index < arr.length - 1 &&
					isVisible(arr[index + 1]) && <ResizeHandle direction="horizontal" />}
			</>
		);
	});
	return (
		<PanelGroup direction="horizontal">
			{snippetPanels}
			{children}
		</PanelGroup>
	);
};
