import Input from "@/components/shared/Input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@studio/components/ui/dialog";

import Button from "@/components/shared/Button";
import type { GithubRepository } from "@codemod-com/api-types";
import useDebounce from "@studio/hooks/useDebounce";
import { Folder } from "lucide-react";
import { useMemo, useState } from "react";
import { useRepositories } from "../hooks/useRepositories";
import RepoList from "./RepoList";

export type Props = {
  open: boolean;
  onConfirm: (repo: string) => void;
  onOpenChange: (open: boolean) => void;
};

const RepositorySelector = ({ onConfirm, onOpenChange, open }: Props) => {
  const { data, isLoading } = useRepositories();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [selectedRepository, setSelectedRepository] =
    useState<GithubRepository>();

  const handleButtonClick = async () => {
    if (!selectedRepository) {
      return;
    }

    onConfirm(selectedRepository.html_url);
  };

  const filteredRepos = useMemo(() => {
    return (data?.data ?? []).filter((repo) =>
      repo.name.includes(debouncedSearch),
    );
  }, [debouncedSearch, data?.data]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent className="bg-primary-dark dark:bg-primary-light p-s max-w-[360px] max-h-[520px] !rounded-[16px] !flex !flex-col gap-s">
          <DialogTitle className="flex gap-xs items-center font-bold">
            <Folder size={20} />
            Select repository
          </DialogTitle>
          <DialogDescription>
            This repository will be analyzed to provide all the insights and
            recommended actions
          </DialogDescription>
          <Input
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            placeholder="Search"
            icon={"search"}
            onClear={() => {
              setSearch("");
            }}
            value={search}
            inputClassName="placeholder:text-secondary-light dark:placeholder:text-secondary-dark"
            iconClassName="text-secondary-light dark:text-secondary-dark w-5 h-5"
            commandClassName="max-h-[20px] !font-medium !body-s-medium"
            className="bg-white dark:bg-black !rounded-[6px] !p-xxs"
          />
          {isLoading && "Loading..."}
          {filteredRepos.length !== 0 ? (
            <div className="overflow-y-auto">
              <RepoList
                repositories={filteredRepos}
                onRepoSelect={setSelectedRepository}
                selectedRepositoryId={selectedRepository?.id ?? null}
              />
            </div>
          ) : (
            <p className="text-center">No repositories found</p>
          )}
          <div className="flex justify-end">
            <Button
              disabled={!selectedRepository}
              intent="primary"
              onClick={handleButtonClick}
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default RepositorySelector;
