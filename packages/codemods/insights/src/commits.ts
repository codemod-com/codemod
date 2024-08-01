import { addMilliseconds } from "date-fns";

export type CommitData = {
  date: Date;
  commit: string;
};

export const getCommitsWithInterval = (
  commits: CommitData[],
  intervalDuration: number,
) => {
  if (commits.length === 0) return [];

  const firstCommitDate = commits.at(-1)?.date.getTime();
  const lastCommitDate = commits.at(0)?.date.getTime();

  if (!firstCommitDate || !lastCommitDate) {
    return [];
  }

  const commitsWithInterval: CommitData[] = [];
  let nextTargetDate = firstCommitDate;

  let i = 0;
  while (lastCommitDate && nextTargetDate < lastCommitDate) {
    let closestCommit = commits.at(0)!;
    let minTimeDiff = Math.abs(nextTargetDate - closestCommit.date.getTime());

    for (const commit of commits) {
      const timeDiff = Math.abs(nextTargetDate - commit.date.getTime());
      if (timeDiff < minTimeDiff) {
        minTimeDiff = timeDiff;
        closestCommit = commit;
      }
    }

    commitsWithInterval.push({
      commit: closestCommit.commit,
      date: closestCommit.date,
    });

    nextTargetDate = addMilliseconds(
      firstCommitDate,
      intervalDuration * (i + 1),
    ).getTime();

    i++;
  }

  return commitsWithInterval;
};
