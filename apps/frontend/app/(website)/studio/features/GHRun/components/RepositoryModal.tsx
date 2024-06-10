import Input from "@/components/shared/Input";
import {
  DropdownSelector,
  useBranchLogic,
  useHandleCodemodRun,
} from "@features/GHRun";
import type { CodemodRunRequest } from "@shared/types";
import Modal from "@studio/components/Modal";
import { Button } from "@studio/components/ui/button";
import type { GHBranch, GithubRepository } from "be-types";
import { isNil } from "ramda";
import { type SetStateAction, useState } from "react";

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

  const [codemodNameInput, setCodemodNameInput] = useState<string>();

  const handleCodemodRun = useHandleCodemodRun({
    onCodemodRun,
    codemodName: codemodNameInput,
    selectedRepository,
    selectedBranch,
  });

  const handleButtonClick = async () => {
    await handleCodemodRun();
    setSelectedRepository(undefined);
    setSelectedBranch(undefined);
    setCodemodNameInput("");
    hideRepositoryModal();
  };

  const renderHint = () => {
    if (!selectedRepository) {
      return "Select repository to run the codemod";
    }
    if (!selectedBranch) {
      return "Select branch to run the codemod";
    }
    if (!codemodNameInput) {
      return "Enter a codemod name to run the codemod";
    }
    return null;
  };

  const isButtonDisabled = [
    selectedRepository,
    selectedBranch,
    codemodNameInput,
  ].some((item) => !item);

  return isRepositoryModalShown ? (
    <Modal onClose={hideRepositoryModal} centered transparent={false}>
      <h2 className="text-center p-2">Run Codemod on Github branch</h2>

      <div className="flex justify-center items-center p-4 bg-white min-w-[400px] rounded-lg border-0">
        <Input
          type="text"
          value={codemodNameInput}
          placeholder="Codemod name (required)"
          onChange={(event: {
            target: { value: SetStateAction<string | undefined> };
          }) => setCodemodNameInput(event.target.value)}
        />
      </div>

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
