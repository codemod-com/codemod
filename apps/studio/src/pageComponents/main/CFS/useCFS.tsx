import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	selectFirstTreeNode,
	selectSnippetsFor,
} from '~/store/slices/snippets';
import { selectActiveSnippet } from '~/store/slices/view';
import { setParentNodes } from '../../../store/slices/CFS';
import extractParentNodes from '../../../utils/extractParentNodes';

const useUpdateCFSStateEffect = () => {
	const activeSnippet = useSelector(selectActiveSnippet);
	const firstNodeTree = useSelector(
		selectFirstTreeNode('before', activeSnippet),
	);
	const { rootNode } = useSelector(
		selectSnippetsFor('before', activeSnippet),
	);

	const dispatch = useDispatch();

	useEffect(() => {
		if (!firstNodeTree || !rootNode) {
			return;
		}
		const parentNodes = extractParentNodes(rootNode, firstNodeTree);

		dispatch(setParentNodes(parentNodes));
	}, [dispatch, firstNodeTree, rootNode]);
};

export default useUpdateCFSStateEffect;
