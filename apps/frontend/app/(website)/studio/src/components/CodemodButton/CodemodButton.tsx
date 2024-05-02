import type { GithubRepository } from "@/types/object.types";
import getGHBranches from "@/utils/apis/getGHBranches";
import { Check as CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { ProgressBar } from "@studio/components/CodemodButton/ProgressBar";
import { useHandleCodemodRun } from "@studio/components/CodemodButton/useHandleCodemodRun";
import { useOpenRepoModalAfterSignIn } from "@studio/components/CodemodButton/useOpenRepoModalAfterSignIn";
import { Button } from "@studio/components/ui/button";
import { mockData } from "@studio/hooks/useAPI";
import { useAuth } from "@studio/hooks/useAuth";
import { useCodemodExecution } from "@studio/hooks/useCodemodExecution";
import { useEnsureUserSigned } from "@studio/hooks/useEnsureUserSigned";
import { useEffect, useState } from "react";
import { RepositoryModal } from "./RepositoryModal";
import { getButtonPropsByStatus } from "./getButtonPropsByStatus";

export const CodemodButton = () => {
  const { getToken } = useAuth();

  const [repositoriesToShow, setRepositoriesToShow] = useState<
    GithubRepository[]
  >(mockData.repositories.data); // @TODO initialize it with empty array when integrated with backend
  const [selectedRepository, setSelectedRepository] =
    useState<GithubRepository>();

  const [branchesToShow, setBranchesToShow] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>();
  const [targetPathInput, setTargetPathInput] = useState<string>("");

  const { codemodRunStatus, onCodemodRunCancel } = useCodemodExecution();

  const {
    showModalWithRepositories,
    hideRepositoryModal,
    isRepositoryModalShown,
  } = useOpenRepoModalAfterSignIn(setRepositoriesToShow);

  const showRepoModalToSignedUser = useEnsureUserSigned(
    showModalWithRepositories,
    "openRepoModal",
  );

  const status = codemodRunStatus?.status ?? "idle";

  const onClick =
    status === "progress" ? onCodemodRunCancel : showRepoModalToSignedUser;

  const { text, hintText } = getButtonPropsByStatus(status);

  const onRunCodemod = async () => {
    await handleCodemodRun();
    hideRepositoryModal();
  };

  const selectRepository = (name: GithubRepository["full_name"]) =>
    setSelectedRepository(
      repositoriesToShow.find((repo) => repo.full_name === name),
    );
  const selectBranch = (branch: string) =>
    setSelectedBranch(branchesToShow.find((name) => name === branch));

  const handleCodemodRun = useHandleCodemodRun(
    selectedRepository,
    selectedBranch,
    targetPathInput,
  );

  useEffect(() => {
    if (selectedRepository) {
      const getBranches = async () => {
        const token = await getToken();
        if (token === null) {
          return;
        }
        const branches = await getGHBranches({
          repo: selectedRepository,
          token,
        });
        if (branches === null) {
          return;
        }

        setBranchesToShow(branches.slice());
      };
      // @TODO remove the code below when integrated with backend
      setBranchesToShow(mockData.branches.data);
      // @TODO uncomment the code below when integrated with backend
      // getBranches();
    }
  }, [getToken, selectedRepository]);

  return (
    <>
      <RepositoryModal
        hideRepositoryModal={hideRepositoryModal}
        isRepositoryModalShown={isRepositoryModalShown}
        repositoriesToShow={repositoriesToShow}
        selectRepository={selectRepository}
        selectedRepository={selectedRepository}
        branchesToShow={branchesToShow}
        selectBranch={selectBranch}
        selectedBranch={selectedBranch}
        targetPathInput={targetPathInput}
        setTargetPathInput={setTargetPathInput}
        onRunCodemod={onRunCodemod}
      />
      <ProgressBar codemodRunStatus={codemodRunStatus} />
      <Button
        onClick={onClick}
        size="xs"
        variant="outline"
        className="flex gap-1"
        hint={<p className="font-normal">{hintText}</p>}
      >
        <CheckIcon />
        {text}
      </Button>
    </>
  );
};
