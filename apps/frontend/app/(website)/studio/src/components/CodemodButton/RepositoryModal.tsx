import Modal from "@studio/components/Modal";
import { Button } from "@studio/components/ui/button";
import type { GithubRepository } from "be-types";
import { matchSorter } from "match-sorter";

import Input from "@/components/shared/Input";
import {
  Combobox,
  ComboboxItem,
  ComboboxList,
  ComboboxProvider,
} from "@ariakit/react";
import * as RadixSelect from "@radix-ui/react-select";
import { DropdownSelector } from "@studio/components/CodemodButton/Dropdown";
import { useFilteredItems } from "@studio/components/CodemodButton/useFilter";
import { CheckIcon, ChevronUpDownIcon, SearchIcon } from "@studio/icons";
import type { ToVoid } from "@studio/types/transformations";
import { startTransition, useMemo, useState } from "react";

export type RepositoryModalProps = {
  hideRepositoryModal: VoidFunction;
  isRepositoryModalShown: boolean;
  repositoriesToShow: GithubRepository[];
  selectRepository: ToVoid<GithubRepository["full_name"]>;
  selectedRepository?: GithubRepository;
  branchesToShow: { name: string }[];
  selectBranch: ToVoid<string>;
  selectedBranch?: { name: string };
  codemodNameInput: string;
  setCodemodNameInput: ToVoid<string>;
  targetPathInput: string;
  setTargetPathInput: ToVoid<string>;
  onRunCodemod: VoidFunction;
};
export const RepositoryModal = ({
  hideRepositoryModal,
  isRepositoryModalShown,
  repositoriesToShow,
  selectRepository,
  selectedRepository,
  branchesToShow,
  selectBranch,
  selectedBranch,
  // targetPathInput,
  // setTargetPathInput,
  codemodNameInput,
  setCodemodNameInput,
  onRunCodemod,
}: RepositoryModalProps) => {
  const [repoValueToFilterBy, setRepoValueToFilterBy] = useState<string>();
  const [branchValueToFilterBy, setBranchValueToFilterBy] = useState<string>();
  const [repoSelectorOpen, setRepoSelectorOpen] = useState(false);
  const [branchSelectorOpen, setBranchSelectorOpen] = useState(false);

  const repoMatches = useFilteredItems(
    repositoriesToShow,
    repoValueToFilterBy,
    selectedRepository,
    "full_name",
  );
  const branchMatches = useFilteredItems(
    branchesToShow,
    branchValueToFilterBy,
    selectedBranch,
    "name",
  );

  return isRepositoryModalShown ? (
    <Modal onClose={hideRepositoryModal} centered transparent={false}>
      <h2 className="text-center p-2">Run Codemod on Github branch</h2>

      <div className="flex justify-center items-center p-4 bg-white min-w-[400px] rounded-lg border-0">
        <p className="text-center text-xs">Codemod name (required)</p>
        <Input
          type="text"
          value={codemodNameInput}
          placeholder="JS to TS codemod"
          onChange={(event: any) => setCodemodNameInput(event.target.value)}
        />
      </div>

      <DropdownSelector
        setRepoSelectorOpen={setRepoSelectorOpen}
        repoSelectorOpen={repoSelectorOpen}
        repoMatches={repoMatches}
        selectRepository={selectRepository}
        selectedRepository={selectedRepository}
        setRepoValueToFilterBy={setRepoValueToFilterBy}
        propName="full_name"
      />
      {selectedRepository && (
        <DropdownSelector
          setRepoSelectorOpen={setBranchSelectorOpen}
          repoSelectorOpen={branchSelectorOpen}
          repoMatches={branchMatches}
          selectRepository={selectBranch}
          selectedRepository={selectedBranch}
          setRepoValueToFilterBy={setBranchValueToFilterBy}
        />
      )}

      <Button
        className="m-3 text-amber-50"
        onClick={onRunCodemod}
        hint={
          !selectedRepository ? (
            <p className="font-normal">Select repository to run the codemod</p>
          ) : !selectedBranch ? (
            <p className="font-normal">Select branch to run the codemod</p>
          ) : null
        }
        disabled={!selectedRepository || !selectedBranch}
      >
        Run Codemod
      </Button>
    </Modal>
  ) : null;
};
