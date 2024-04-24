import Text from "@studio/components/Text";
import { Progress } from "@studio/components/ui/progress";
import { useCodemodExecution } from "@studio/hooks/useCodemodExecution";

export type ProgressBarProps = {
  codemodRunStatus: ReturnType<typeof useCodemodExecution>["codemodRunStatus"];
};
export const ProgressBar = ({ codemodRunStatus }: ProgressBarProps) => {
  const progressInfo =
    codemodRunStatus?.status === "progress"
      ? codemodRunStatus.progressInfo
      : null;

  const isFetchingRepo =
    codemodRunStatus?.status === "progress" &&
    codemodRunStatus.progressInfo === null;
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
