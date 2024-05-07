import type { GithubRepository } from "@/types/object.types";
import getGHBranches from "@/utils/apis/getGHBranches";
import { Check as CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { ProgressBar } from "@studio/components/CodemodButton/ProgressBar";
import { useHandleCodemodRun } from "@studio/components/CodemodButton/useHandleCodemodRun";
import { useOpenRepoModalAfterSignIn } from "@studio/components/CodemodButton/useOpenRepoModalAfterSignIn";
import { Button } from "@studio/components/ui/button";
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
  >([]);
  const [selectedRepository, setSelectedRepository] =
    useState<GithubRepository>();

  const [branchesToShow, setBranchesToShow] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>();
  const [targetPathInput, setTargetPathInput] = useState<string>("");
  const [codemodNameInput, setCodemodNameInput] = useState<string>("Untitled");

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

  const onRunCodemod = async () => {
    await handleCodemodRun();
    hideRepositoryModal();
  };

  useEffect(() => {
    if (!selectedRepository) {
      return;
    }

    const getBranches = async () => {
      const token = await getToken();
      if (token === null) {
        return;
      }
      const branches = await getGHBranches({
        repoUrl: selectedRepository.html_url,
        token,
      });
      if (branches === null) {
        return;
      }

      setBranchesToShow(branches.slice());
    };

    getBranches();
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
        codemodNameInput={codemodNameInput}
        setCodemodNameInput={setCodemodNameInput}
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
