import { useDispatch, useSelector } from "react-redux";
import { Tooltip } from "react-tooltip";
import Checkbox from "~/components/CheckBox";
import Collapsable from "~/components/Collapsable";
import Panel from "~/components/Panel";
import Text from "~/components/Text";
import { selectCFS, toggleSelectedNodeId } from "~/store/slices/CFS";
import { selectSnippets } from "~/store/slices/snippets";

const ParentNodesSelector = () => {
	const { selectedNodeIds, parentNodes } = useSelector(selectCFS);
	const { inputSnippet } = useSelector(selectSnippets);

	const dispatch = useDispatch();

	const filteredParentNodes = parentNodes.filter(
		({ label }) => !["File", "Program"].includes(label),
	);

	if (!filteredParentNodes.length) {
		return null;
	}

	return (
		<Panel className="flex max-h-1/3 w-full flex-col overflow-hidden">
			<Collapsable
				className="h-full"
				contentWrapperClassName="h-full"
				defaultCollapsed
				rightContent={undefined}
				title={
					<Text className="" fontWeight="semibold" isTitle>
						Filter by the ancestor nodes
					</Text>
				}
			>
				{filteredParentNodes.length > 0 && (
					<div className="mt-1 flex  h-[20vh] flex-col  overflow-x-auto overflow-y-auto">
						{filteredParentNodes.map((node, index) => (
							<div
								key={`${node.id}-${index}`}
								className="mb-3 flex items-center bg-gray-lighter dark:bg-gray-dark"
								style={{
									marginLeft: `${index * 24}px`,
								}}
							>
								<Checkbox
									checked={selectedNodeIds.includes(node.id)}
									className={` ml-[${
										index * 2
									}px] w-60 rounded bg-gray-lighter p-1 dark:bg-gray-dark`}
									key={node.id}
									label={node.label}
									onChange={() => {
										dispatch(toggleSelectedNodeId(node.id));
									}}
								/>
								<div
									className="ml-3 flex"
									data-tooltip-content={inputSnippet.slice(
										node.start,
										node.end,
									)}
									data-tooltip-id="parent-source-code-tooltip"
								>
									<Text className=" line-clamp-1">
										{inputSnippet.slice(node.start, node.end)}
									</Text>
								</div>
							</div>
						))}
						<Tooltip
							className="z-50 w-auto bg-gray-light text-center text-xs text-gray-text-dark-title dark:bg-gray-lighter dark:text-gray-text-title "
							delayHide={0}
							delayShow={100}
							id="parent-source-code-tooltip"
						/>
					</div>
				)}
			</Collapsable>
		</Panel>
	);
};

export default ParentNodesSelector;
