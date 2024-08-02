import type { GithubRepository } from "be-types";
import { cx } from "cva";
import RepositoryLanguage from "./RepositoryLanguage";

type Props = {
  repository: GithubRepository;
  isActive: boolean;
  onClick(repo: GithubRepository): void;
};

const RepositoryItem = ({ repository, isActive, onClick }: Props) => {
  return (
    <div
      role="button"
      onClick={() => onClick(repository)}
      className={cx(
        "flex flex-col gap-[12px] py-xs px-[12px] bg-emphasis-light dark:bg-emphasis-dark rounded-[8px] hover:bg-primary-dark dark:hover:bg-primary-light border cursor-pointer",
        {
          // @TODO make List and ListItem components, that handles hover, active logic
          "!bg-primary-dark !dark:bg-primary-light border-2": isActive,
        },
      )}
    >
      <span className="body-m-medium">{repository.name}</span>
      {repository.language && (
        <RepositoryLanguage language={repository.language} />
      )}
    </div>
  );
};

export default RepositoryItem;
