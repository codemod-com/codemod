import type { GithubRepository } from "@codemod-com/api-types";
import { memo } from "react";
import RepositoryItem from "./RepositoryItem";

type Props = {
  repositories: GithubRepository[];
  onToggleRepo(repo: GithubRepository): void;
};

const RepoList = ({ repositories, onToggleRepo }: Props) => {
  return (
    <ul className="flex flex-col gap-xs m-0">
      {repositories.map((repository) => (
        <li key={repository.id}>
          <RepositoryItem repository={repository} onClick={onToggleRepo} />
        </li>
      ))}
    </ul>
  );
};

export default memo(RepoList);
