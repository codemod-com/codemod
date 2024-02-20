import { useSelector } from "react-redux";
import { selectFirstTreeNode } from "~/store/slices/snippets";
import Panel from "../../../components/Panel";
import Text from "../../../components/Text";
import useFeatureFlags from "../../../hooks/useFeatureFlags";
import ParentNodesSelector from "../ParentNodesSelector";
import GeneratedOutput from "./GeneratedOutput";
import NodeSelectorTreeContainer from "./NodeSelectorTreeContainer";
import NodeSelectorTreeContainerCheckboxes from "./NodeSelectorTreeContainerCheckboxes";
import NodeTreeValues from "./NodeTreeValues";
import SelectionShowCase from "./SelectionShowCase";
import useUpdateCFSStateEffect from "./useCFS";

const CFSContent = () => {
	const features = useFeatureFlags();
	const showCheckboxes = features.includes("cfrs-checkbox");
	const firstTreeNode = useSelector(selectFirstTreeNode("before"));

	useUpdateCFSStateEffect();

	if (firstTreeNode === null) {
		return (
			<Text className="text-center">
				Select any node in the Snippet Before to see the Find & Replace
				statement builder.
			</Text>
		);
	}

	return (
		<>
			<ParentNodesSelector />
			<div className="flex max-h-1/3 flex-col ">
				<div className="max-h-96 grid min-h-min grid-cols-2 overflow-y-auto">
					<Panel className=" w-full">
						{showCheckboxes ? (
							<NodeSelectorTreeContainerCheckboxes />
						) : (
							<NodeSelectorTreeContainer />
						)}
					</Panel>
					<Panel>
						<NodeTreeValues />
					</Panel>
				</div>
				<Panel className="w-full">
					<SelectionShowCase />
				</Panel>
			</div>
			<GeneratedOutput />
		</>
	);
};

export default CFSContent;
