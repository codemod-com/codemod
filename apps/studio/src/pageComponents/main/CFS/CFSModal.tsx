import { useDispatch, useSelector } from 'react-redux';
import { selectFirstTreeNode } from '~/store/slices/snippets';
import { selectActiveSnippet } from '~/store/slices/view';
import Modal from '../../../components/Modal';
import Text from '../../../components/Text';
import { selectCFS, setIsOpen } from '../../../store/slices/CFS';
import CFSContent from './CFSContent';

const CFSModal = () => {
	const activeSnippet = useSelector(selectActiveSnippet);
	const { isOpen } = useSelector(selectCFS);
	const firstTreeNode = useSelector(
		selectFirstTreeNode('after', activeSnippet),
	);
	const dispatch = useDispatch();

	return isOpen ? (
		<Modal
			centered
			height="h-full"
			onClose={() => dispatch(setIsOpen(false))}
			transparent={false}
			width="w-9/12"
		>
			<Modal.Header>
				<Text
					className="my-2"
					fontWeight="semibold"
					heading="h3"
					isTitle
				>
					{firstTreeNode !== null
						? 'Create Find & Replace Statement'
						: 'Create Find Statement'}
				</Text>
			</Modal.Header>
			<Modal.Body>
				<div className="flex h-full min-w-[50vw] max-w-[75vw] flex-col gap-2 bg-gray-bg-light dark:bg-gray-darker">
					<CFSContent />
				</div>
			</Modal.Body>
		</Modal>
	) : null;
};

export default CFSModal;
