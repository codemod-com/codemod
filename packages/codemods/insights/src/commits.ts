import { addMilliseconds } from "date-fns";

type CommitData = {
  date: Date;
  commit: string;
};

export const getAllCommits = async (
  exec: (...args: any[]) => Promise<string>,
): Promise<CommitData[]> => {
  const command = `git log --pretty=format:"%H %ci"`;
  const result = await exec(command);

  return result.split("\n").map((line) => {
    const [commit, ...dateParts] = line.split(" ");
    return { commit, date: new Date(dateParts.join(" ")) };
  });
};

export const getCommitsWithInterval = async (
  allCommits: CommitData[],
  intervalDuration: number,
) => {
  if (allCommits.length === 0) return [];

  const totalCommits = allCommits.length;
  const firstCommitDate = allCommits[totalCommits - 1].date.getTime();
  const lastCommitDate = allCommits[0].date.getTime();

  const commitsWithInterval: CommitData[] = [];
  let nextTargetDate = firstCommitDate;

  let i = 0;
  while (lastCommitDate && nextTargetDate < lastCommitDate) {
    let closestCommit = allCommits[0];
    let minTimeDiff = Math.abs(nextTargetDate - closestCommit.date.getTime());

    for (const commit of allCommits) {
      const timeDiff = Math.abs(nextTargetDate - commit.date.getTime());
      if (timeDiff < minTimeDiff) {
        minTimeDiff = timeDiff;
        closestCommit = commit;
      }
    }

    commitsWithInterval.push({
      commit: closestCommit.commit,
      timestamp: closestCommit.date.toISOString(),
    });

    nextTargetDate = addMilliseconds(
      firstCommitDate,
      intervalDuration * (i + 1),
    ).getTime();

    i++;
  }

  return commitsWithInterval;
};
