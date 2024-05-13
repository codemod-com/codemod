import type { GetExecutionStatusResponse } from "@/utils/apis/getExecutionStatus";
import Text from "@studio/components/Text";
import { Progress } from "@studio/components/ui/progress";
import type { useCodemodExecution } from "@studio/hooks/useCodemodExecution";

export type ProgressBarProps = {
  codemodRunStatus: GetExecutionStatusResponse;
};
export const ProgressBar = ({ codemodRunStatus }: ProgressBarProps) => {
  const progressInfo =
    codemodRunStatus?.result?.status === "executing codemod"
      ? codemodRunStatus?.result.progress
      : null;

  const isFetchingRepo = codemodRunStatus?.result?.status === "progress";
  const fetchingRepositoryText = (
    <Text heading="span" size="sm" color="black" className="mr-3 text-center">
      Fetching repository...
    </Text>
  );
  const progressInfoBar = progressInfo && (
    <div className="flex flex-col items-center justify-center w-80">
      <Progress
        className="mt-2"
        value={(progressInfo.processed / progressInfo.total) * 100}
      />
    </div>
  );

  return isFetchingRepo ? fetchingRepositoryText : progressInfoBar;
};
