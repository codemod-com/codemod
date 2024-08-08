import Checkbox from "@/components/shared/Checkbox";
import type { GithubRepository } from "@codemod-com/api-types";
import { cx } from "cva";

type Props = {
  repository: GithubRepository;
  onClick(repo: GithubRepository): void;
};

const RepositoryItem = ({ repository, onClick }: Props) => {
  return (
    <div
      role="button"
      onClick={() => onClick(repository)}
      className={cx(
        "flex items-center justify-between px-2 py-1 bg-primary-dark dark:bg-emphasis-dark hover:bg-emphasis-light dark:hover:bg-primary-light cursor-pointer",
      )}
    >
      <Checkbox required className="!w-4 !h-4">
        <span className="body-m-medium">{repository.name}</span>
      </Checkbox>
    </div>
  );
};

export default RepositoryItem;
