import type {
  CodemodRunRequest,
  GHBranch,
  GithubRepository,
} from "@codemod-com/api-types";
import {
  DropdownSelector,
  useBranchLogic,
  useHandleCodemodRun,
} from "@features/GHRun";
import Modal from "@studio/components/Modal";
import { Button } from "@studio/components/ui/button";
import { isNil } from "ramda";
import { useState } from "react";

export type RepositoryModalProps = {
  onCodemodRun: (request: CodemodRunRequest) => Promise<void>;
  hideRepositoryModal: VoidFunction;
  isRepositoryModalShown: boolean;
  repositoriesToShow: GithubRepository[];
  branchesToShow: GHBranch[];
  setBranchesToShow: React.Dispatch<React.SetStateAction<GHBranch[]>>;
  areReposLoading: boolean;
};

export const RepositoryModal = ({
  onCodemodRun,
  setBranchesToShow,
  branchesToShow,
  hideRepositoryModal,
  isRepositoryModalShown,
  repositoriesToShow,
  areReposLoading,
}: RepositoryModalProps) => {
  const [selectedRepository, setSelectedRepository] =
    useState<GithubRepository>();
  const selectRepository = (name: GithubRepository["full_name"]) => {
    setBranchesToShow([]);
    setSelectedRepository(
      repositoriesToShow.find((repo) => repo.full_name === name),
    );
  };

  const {
    setSelectedBranch,
    selectedBranch,
    selectBranch,
    isFetching: areBranchesLoading,
  } = useBranchLogic({
    branchesToShow,
    setBranchesToShow,
    selectedRepository,
  });

  const handleCodemodRun = useHandleCodemodRun({
    onCodemodRun,
    selectedRepository,
    selectedBranch,
  });

  const handleButtonClick = async () => {
    await handleCodemodRun();
    setSelectedRepository(undefined);
    setSelectedBranch(undefined);
    hideRepositoryModal();
  };

  const renderHint = () => {
    if (!selectedRepository) {
      return "Select repository to run the codemod";
    }
    if (!selectedBranch) {
      return "Select branch to run the codemod";
    }
    return null;
  };

  const isButtonDisabled = [selectedRepository, selectedBranch].some(
    (item) => !item,
  );

  return isRepositoryModalShown ? (
    <Modal onClose={hideRepositoryModal} centered transparent={false}>
      <h2 className="text-center p-2">Run Codemod on Github branch</h2>
      <DropdownSelector
        isLoading={areReposLoading}
        loadingMessage="Fetching repos"
        items={repositoriesToShow}
        placeholder="Select a repository (required)"
        onSelect={selectRepository}
        selectedValue={selectedRepository}
        propName="full_name"
      />

      <DropdownSelector
        isLoading={areBranchesLoading}
        items={branchesToShow}
        loadingMessage="Fetching branches"
        placeholder="Select a branch (required)"
        onSelect={selectBranch}
        selectedValue={selectedBranch}
        propName="name"
        isDisabled={isNil(selectedRepository)}
      />

      <Button
        className="m-3 text-amber-50"
        onClick={handleButtonClick}
        hint={<p className="font-normal">{renderHint()}</p>}
        disabled={isButtonDisabled}
      >
        Run Codemod
      </Button>
    </Modal>
  ) : null;
};
