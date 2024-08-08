// @TODO move to shared or global
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
import type {
  GithubOrganization,
  GithubRepository,
} from "@codemod-com/api-types";
import { Separator } from "@studio/components/ui/separator";
import useDebounce from "@studio/hooks/useDebounce";
import { Folder } from "lucide-react";
import { useMemo, useState } from "react";
import { useOrganizations } from "../../hooks/useOrganizations";
import { useRepositories } from "../../hooks/useRepositories";
import OrganizationList from "./OrganizationList";
import RepoList from "./RepoList";

export type Props = {
  open: boolean;
  onConfirm: (repo: GithubRepository) => void;
  onOpenChange: (open: boolean) => void;
};

const RepositorySelector = ({ onConfirm, onOpenChange, open }: Props) => {
  const { data: organizationList, isLoading: organizationsLoading } =
    useOrganizations();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [selectedRepository, setSelectedRepository] =
    useState<GithubRepository>();

  const [selectedOrganization, setSelectedOrganization] =
    useState<GithubOrganization>();

  const { data: repositoryList, isLoading: repositoriesLoading } =
    useRepositories(selectedOrganization);

  const handleButtonClick = async () => {
    if (!selectedRepository) {
      return;
    }

    onConfirm(selectedRepository);
  };

  const repos = repositoryList?.data ?? [];

  const filteredRepos = useMemo(() => {
    return repos.filter((repo) => repo.name.includes(debouncedSearch));
  }, [debouncedSearch, repos]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent className="bg-primary-dark dark:bg-primary-light p-s max-w-[360px] max-h-[520px] !rounded-[16px] !flex !flex-col gap-[12px]">
          <DialogTitle className="flex gap-xs items-center font-bold">
            <Folder size={20} />
            {!selectedOrganization ? "Select an organization" : null}
          </DialogTitle>
          <DialogDescription>
            This repository will be analyzed to provide all the insights and
            recommended actions
          </DialogDescription>
          <Separator
            orientation="horizontal"
            className="bg-border-light dark:bg-border-dark"
          />
          {selectedOrganization ? (
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
          ) : null}

          <div className="overflow-y-auto">
            {selectedOrganization ? (
              <RepoList
                repositories={filteredRepos}
                onRepoSelect={setSelectedRepository}
                selectedRepositoryId={selectedRepository?.id ?? null}
              />
            ) : (
              <OrganizationList
                organizations={organizationList?.data ?? []}
                onSelectOrganization={setSelectedOrganization}
              />
            )}
          </div>
          <div className="flex justify-end">
            <Button
              disabled={!selectedRepository}
              intent="primary"
              // hint={''}
              onClick={handleButtonClick}
            >
              Apply
            </Button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default RepositorySelector;
