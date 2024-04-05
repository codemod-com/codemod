import Tooltip from "~/components/Tooltip/Tooltip";
import { Button } from "~/components/ui/button";
import { ExampleIcon } from "~/icons/Example";
import {
	AFTER_SNIPPET_DEFAULT_CODE,
	BEFORE_SNIPPET_DEFAULT_CODE,
	DEFAULT_TEST_FIXTURE_DIR,
	buildDefaultCodemodSource,
} from "~/store/getInitialState";
import { useFilesStore } from "~/store/zustand/file";
import { useModStore } from "~/store/zustand/mod";
import { useSnippetStore } from "~/store/zustand/snippets";

const InsertExampleButton = () => {
	const { engine } = useSnippetStore();
	const { setContent } = useModStore();

	const { selectAll, upsertMany } = useFilesStore();

	const setDefaultFixtureFiles = (directoryHashDigest: string) => {
		const files = selectAll({ parent: directoryHashDigest }).map((file) => {
			const newContent =
				file.name === "after.tsx"
					? AFTER_SNIPPET_DEFAULT_CODE
					: BEFORE_SNIPPET_DEFAULT_CODE;

			return {
				...file,
				content: newContent,
			};
		});

		upsertMany(files);
	};

	return (
		<Tooltip
			trigger={
				<Button
					className="flex items-center justify-center px-0"
					onClick={() => {
						setDefaultFixtureFiles(DEFAULT_TEST_FIXTURE_DIR.hashDigest);
						setContent(buildDefaultCodemodSource(engine));
					}}
					size="xs"
					variant="ghost"
				>
					{/* <KeyboardIcon className="h-4 w-4" /> */}
					<ExampleIcon />
					<span className="sr-only">Insert Example</span>
				</Button>
			}
			content={<p className="font-normal">Insert an example</p>}
		/>
	);
};

export default InsertExampleButton;
