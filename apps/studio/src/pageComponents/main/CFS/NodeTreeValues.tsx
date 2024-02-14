import { useSelector } from 'react-redux';
import { type TreeNode } from '~/components/Tree';
import { cn } from '~/lib/utils';
import Text from '../../../components/Text';
import { selectCFS } from '../../../store/slices/CFS';
import {
	selectFirstTreeNode,
	selectSnippets,
} from '../../../store/slices/snippets';

const EmptyNodeValue = '_(No value)_';

const NodeTreeValues = () => {
	const firstRange = useSelector(selectFirstTreeNode('before'));
	const snippet = useSelector(selectSnippets);
	const { hoveredNode } = useSelector(selectCFS);

	if (firstRange === null) {
		return null;
	}

	return (
		<div className="flex flex-col px-2 pb-2">
			{firstRange.children && firstRange.children.length > 0 && (
				<Text
					className={cn('mt-2 line-clamp-1 h-[24px]', {
						'bg-highlight': hoveredNode?.id === firstRange.id,
					})}
					isTitle
					size="base"
				>
					{snippet.inputSnippet}
				</Text>
			)}
			<NodeValue
				beforeSnippet={snippet.inputSnippet}
				hoveredNodeId={hoveredNode?.id ?? null}
				treeNode={firstRange}
			/>
		</div>
	);
};

const NodeValue = ({
	treeNode,
	beforeSnippet,
	hoveredNodeId,
}: {
	treeNode: TreeNode;
	beforeSnippet: string;
	hoveredNodeId: string | null;
}) => {
	const slicedSnippet = beforeSnippet
		.slice(treeNode.start, treeNode.end)
		.trim();
	if (!treeNode.children?.length) {
		return (
			<Text
				className={cn(
					'mt-2 h-[24px] ',
					hoveredNodeId === treeNode.id && 'bg-highlight',
				)}
			>
				{slicedSnippet || EmptyNodeValue}
			</Text>
		);
	}

	return (
		<>
			{treeNode.children.map((child) => {
				const childSlicedSnippet = beforeSnippet
					.slice(child.start, child.end)
					.trim();
				return (
					<>
						{child.children?.length ? (
							<Text
								className={cn('mt-2 line-clamp-1 h-[24px]', {
									'bg-highlight': hoveredNodeId === child.id,
								})}
								isTitle
								size="base"
							>
								{childSlicedSnippet || EmptyNodeValue}
							</Text>
						) : (
							''
						)}
						<NodeValue
							beforeSnippet={beforeSnippet}
							hoveredNodeId={hoveredNodeId}
							key={`${child.start}-${child.end}}-${child.id}`}
							treeNode={child}
						/>
					</>
				);
			})}
		</>
	);
};

export default NodeTreeValues;
