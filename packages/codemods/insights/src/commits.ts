import type { exec as execFn } from "@codemod.com/workflow";
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

export const runForEachCommit = async (
  commits: CommitData[],
  exec: typeof execFn,
  callback: (commit: CommitData) => Promise<any>,
) => {
  for (const commit of commits) {
    await exec(`git checkout ${commit.commit}`);
    await callback(commit);
  }

  await exec("git checkout HEAD");
};
