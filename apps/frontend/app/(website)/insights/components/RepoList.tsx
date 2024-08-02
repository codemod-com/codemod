import type { GithubRepository } from "be-types";
import { memo } from "react";
import RepositoryItem from "./RepositoryItem";

type Props = {
  repositories: GithubRepository[];
  selectedRepositoryId: GithubRepository["id"] | null;
  onRepoSelect(repo: GithubRepository): void;
};

const RepoList = ({
  repositories,
  selectedRepositoryId,
  onRepoSelect,
}: Props) => {
  return (
    <ul className="flex flex-col gap-xs m-0">
      {repositories.map((repository) => (
        <li key={repository.id}>
          <RepositoryItem
            repository={repository}
            onClick={onRepoSelect}
            isActive={selectedRepositoryId === repository.id}
          />
        </li>
      ))}
    </ul>
  );
};

export default memo(RepoList);
