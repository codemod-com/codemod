import Modal from "~/components/Modal";
import { useTheme } from "~/pageComponents/main/themeContext";

export type ProgressModalProps = {
	isProgressModalShown: boolean;
	progress: number;
	hideProgressModal: VoidFunction;
};
export const ProgressModal = ({
	hideProgressModal,
	isProgressModalShown,
	progress,
}: ProgressModalProps) => {
	const { isDark } = useTheme();
	return isProgressModalShown ? (
		<Modal onClose={hideProgressModal} centered transparent={false}>
			<div
				className="flex justify-center align-items-center"
				style={{ padding: "24px", background: "white" }}
			>
				{progress} % done
			</div>
		</Modal>
	) : null;
};
