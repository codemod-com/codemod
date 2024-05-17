import type { GetExecutionStatusResponse } from "@/utils/apis/getExecutionStatus";
import { capitalize } from "@/utils/strings";
import Text from "@studio/components/Text";
import { Progress } from "@studio/components/ui/progress";

export type ProgressBarProps = {
  codemodRunStatus: GetExecutionStatusResponse;
};
export let ProgressBar = ({ codemodRunStatus }: ProgressBarProps) => {
  let progressInfo =
    codemodRunStatus?.result?.status === "executing codemod"
      ? codemodRunStatus?.result.progress
      : null;

  let progressInfoBar =
    progressInfo !== null ? (
      <div className="flex flex-col items-center justify-center w-80">
        <Progress
          className="border-2 border-solid border-primary"
          value={(progressInfo.processed / progressInfo.total) * 100}
        />
      </div>
    ) : null;

  return codemodRunStatus?.result?.status === "progress" ? (
    <Text
      heading="span"
      size="sm"
      color="black"
      className="mr-3 text-center font-bold"
    >
      {`${capitalize(codemodRunStatus.result.message)}...`}
    </Text>
  ) : (
    progressInfoBar
  );
};
