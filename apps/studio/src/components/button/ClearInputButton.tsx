import { Backspace as BackspaceIcon } from "@phosphor-icons/react";
import Tooltip from "~/components/Tooltip/Tooltip";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { DEFAULT_TEST_FIXTURE_DIR } from "~/store/getInitialState";
import { useFilesStore } from "~/store/zustand/file";
import { useModStore } from "~/store/zustand/mod";

type Props = { className?: string };

const ClearInputButton = ({ className }: Props) => {
	const { setContent } = useModStore();

	const { selectAll, setAll } = useFilesStore();

	// set all files content to empty for current test fixture
	const clearFiles = () => {
		const emptyFiles = selectAll({
			// for now test fixture (directory) is hardcoded
			parent: DEFAULT_TEST_FIXTURE_DIR.hashDigest,
		}).map((file) => ({ ...file, content: "" }));

		setAll(emptyFiles);
	};

	return (
		<Tooltip
			trigger={
				<Button
					className={cn("flex items-center justify-center", className)}
					onClick={() => {
						clearFiles();
						setContent("");
					}}
					size="sm"
					variant="outline"
				>
					<BackspaceIcon className="h-4 w-4" />
					<span className="sr-only">Clear Inputs</span>
				</Button>
			}
			content={<p className="font-normal">Clear all inputs</p>}
		/>
	);
};

export default ClearInputButton;
