import { ReactNode } from "react";
import ResizeHandle from "~/components/ResizePanel/ResizeHandler";
import { DiffEditorWrapper } from "~/pageComponents/main/JSCodeshiftRender";
import {
	BottomPanelData,
	ShowPanelTile,
	SnippetData,
} from "~/pageComponents/main/PageBottomPane";
import SnippetUI from "~/pageComponents/main/SnippetUI";

export const getSnippetsData = ({
	beforePanel,
	afterPanel,
	outputPanel,
	onlyAfterHidden,
	warnings,
}: BottomPanelData & {
	onlyAfterHidden: boolean;
	warnings: ReactNode;
}): SnippetData[] => [
	{
		header: "Before",
		panelData: beforePanel,
		diffEditorWrapper: {
			type: "before",
		},
		Snipped: SnippetUI,
		extras: (
			<>
				<ResizeHandle direction="horizontal" />
				{onlyAfterHidden && <ShowPanelTile header="After" panel={afterPanel} />}
			</>
		),
	},
	{
		header: "After (Expected)",
		panelData: afterPanel,
		diffEditorWrapper: {
			warnings,
			type: "after",
		},
		Snipped: DiffEditorWrapper,
		extras: !onlyAfterHidden && <ResizeHandle direction="horizontal" />,
	},
	{
		header: "Output",
		panelData: outputPanel,
		Snipped: DiffEditorWrapper,
		diffEditorWrapper: {
			type: "output",
		},
	},
];
