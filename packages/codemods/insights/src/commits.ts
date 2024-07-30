import { addMilliseconds } from "date-fns";

type CommitData = {
    date: Date;
    commit: string;
}

export const getAllCommits = async (exec: (...args: any[]) => Promise<string>): Promise<CommitData[]> => {
    const command = `git log --pretty=format:"%H %ci"`;
    const result = await exec(command);

    return result.split("\n").map((line) => {
        const [commit, ...dateParts] = line.split(" ");
        return { commit, date: new Date(dateParts.join(" ")) };
    });
};

export const getCommitsWithInterval = async (commits: CommitData[], intervalDuration: number) => {
    if (commits.length === 0) return [];

    const totalCommits = commits.length;
    const firstCommitDate = commits[totalCommits - 1].date.getTime();
    const lastCommitDate = commits[0].date.getTime();

    const commitsWithInterval: CommitData[] = [];
    let nextTargetDate = firstCommitDate;

    let i = 0;
    while (lastCommitDate && nextTargetDate < lastCommitDate) {
        let closestCommit = commits[0];
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

export const runForEachCommit = async (commits: CommitData[], exec: (...args: any[]) => Promise<string>, callback: (commit: CommitData) => Promise<any>) => {
    for (const commit of commits) {
        await exec(`git checkout ${commit.commit}`);
        await callback(commit);
    }

    await exec("git checkout HEAD");
}
