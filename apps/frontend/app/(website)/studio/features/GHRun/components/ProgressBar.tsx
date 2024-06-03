import type { GetExecutionStatusResponse } from "@shared/types";
import Text from "@studio/components/Text";
import { Progress } from "@studio/components/ui/progress";
import { capitalize } from "@utils/strings";

export type ProgressBarProps = {
  codemodRunStatus: GetExecutionStatusResponse;
};
export const ProgressBar = ({
  codemodRunStatus: { result },
}: ProgressBarProps) => {
  if (!result) return null;

  // prepare
  if (result?.status === "progress")
    return (
      <Text
        heading="span"
        size="sm"
        color="black"
        className="mr-3 text-center font-bold"
      >
        {`${capitalize(result.message)}...`}
      </Text>
    );

  // execute
  if (result?.status === "executing codemod")
    return (
      <div className="flex flex-col items-center justify-center w-80">
        <Progress
          className="border-2 border-solid border-primary"
          value={(result.progress.processed / result.progress.total) * 100}
        />
      </div>
    );

  return null;
};
