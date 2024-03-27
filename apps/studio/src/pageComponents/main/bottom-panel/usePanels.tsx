import { useToggleVisibility } from "~/hooks/useToggleVisibility";
import ASTViewer from "~/pageComponents/main/ASTViewer";
import {
	ContentViewerVariant,
	Panel,
	PanelData,
} from "~/pageComponents/main/bottom-panel/types";
import { JSEngine } from "~/types/Engine";

export const getContent = (type: ContentViewerVariant) => (engine: JSEngine) =>
	engine === "jscodeshift" ? (
		<ASTViewer type={type} />
	) : (
		"The AST View is not yet supported for tsmorph"
	);

export const usePanels = () => {
	const beforePanel: PanelData = {
		astIndex: Panel.BEFORE_AST,
		snippedIndex: Panel.BEFORE_SNIPPET,
		type: "before",
		hasBoundResize: true,
		// there is a bug with resizing After panel when hiding and showing Before panel
		// needs to be fixed in the library itself or to find a workaround
		// visibilityOptions: useToggleVisibility(),
		content: getContent("before"),
	};

	const afterPanel: Required<PanelData> = {
		astIndex: Panel.AFTER_AST,
		snippedIndex: Panel.AFTER_SNIPPET,
		type: "after",
		hasBoundResize: false,
		content: getContent("after"),
		visibilityOptions: useToggleVisibility(),
	};

	const outputPanel: PanelData = {
		astIndex: Panel.OUTPUT_AST,
		snippedIndex: Panel.OUTPUT_SNIPPET,
		type: "output",
		content: getContent("output"),
	};

	return {
		beforePanel,
		afterPanel,
		outputPanel,
	};
};
