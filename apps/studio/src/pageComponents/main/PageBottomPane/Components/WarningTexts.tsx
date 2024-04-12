import Text from "~/components/Text";
import { Button } from "~/components/ui/button";
import type { WarningTextsProps } from "~/pageComponents/main/PageBottomPane";

export const WarningTexts = ({
	snippetBeforeHasOnlyWhitespaces,
	firstCodemodExecutionErrorEvent,
	onDebug,
	codemodSourceHasOnlyWhitespaces,
}: WarningTextsProps) => {
	return (
		<div className="text-center">
			{snippetBeforeHasOnlyWhitespaces && (
				<Text>
					Please provide the snippet before the transformation to execute the
					codemod.
				</Text>
			)}
			{codemodSourceHasOnlyWhitespaces && (
				<Text>Please provide the codemod to execute it.</Text>
			)}
			{firstCodemodExecutionErrorEvent !== undefined ? (
				<Text>
					Codemod has execution error(s). Please, check the
					<Button
						variant="link"
						className="text-md -ml-1 pt-3 font-light text-gray-500 dark:text-gray-300"
						onClick={onDebug}
					>
						Debugger
					</Button>
					to get more info.
				</Text>
			) : null}
		</div>
	);
};
