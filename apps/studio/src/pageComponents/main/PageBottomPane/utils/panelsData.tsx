import ASTViewer from "~/pageComponents/main/ASTViewer";
import {
	ContentViewerVariant,
	PanelData,
	ResizablePanelsIndices,
} from "~/pageComponents/main/PageBottomPane/utils/types";
import { JSEngine } from "~/types/Engine";
import { Repeat } from "~/types/transformations";

export const getContent = (type: ContentViewerVariant) => (engine: JSEngine) =>
	engine === "jscodeshift" ? (
		<ASTViewer type={type} />
	) : (
		"The AST View is not yet supported for tsmorph"
	);

const beforePanel: PanelData = {
	relatedAST: ResizablePanelsIndices.BEFORE_AST,
	boundIndex: ResizablePanelsIndices.BEFORE_AST,
	snippedIndex: ResizablePanelsIndices.BEFORE_SNIPPET,
	type: "before",
	hasBoundResize: true,
	content: getContent("before"),
	snippetData: {
		header: "Before",
		diffEditorWrapper: {
			type: "before",
		},
		snippet: "regular",
	},
};

const afterPanel: PanelData = {
	relatedAST: ResizablePanelsIndices.AFTER_AST,
	snippedIndex: ResizablePanelsIndices.AFTER_SNIPPET,
	type: "after",
	hasBoundResize: false,
	content: getContent("after"),
	snippetData: {
		header: "After (Expected)",
		diffEditorWrapper: {
			type: "after",
		},
		snippet: "diff",
	},
};

const outputPanel: PanelData = {
	relatedAST: ResizablePanelsIndices.OUTPUT_AST,
	snippedIndex: ResizablePanelsIndices.OUTPUT_SNIPPET,
	type: "output",
	content: getContent("output"),
	snippetData: {
		header: "Output",
		snippet: "diff",
		diffEditorWrapper: {
			type: "output",
		},
	},
};

const panels: Repeat<PanelData, 3> = [beforePanel, afterPanel, outputPanel];

export const panelsData = {
	panels,
	beforePanel,
	afterPanel,
	outputPanel,
};
