import { useAuth } from "@/app/auth/useAuth";
import getGHBranches from "@/utils/apis/getGHBranches";
import { Check as CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { ProgressBar } from "@studio/components/CodemodButton/ProgressBar";
import { useHandleCodemodRun } from "@studio/components/CodemodButton/useHandleCodemodRun";
import { useOpenRepoModalAfterSignIn } from "@studio/components/CodemodButton/useOpenRepoModalAfterSignIn";
import { Button } from "@studio/components/ui/button";
import { useCodemodExecution } from "@studio/hooks/useCodemodExecution";
import { useEnsureUserSigned } from "@studio/hooks/useEnsureUserSigned";
import type { GithubRepository } from "be-types";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { RepositoryModal } from "./RepositoryModal";
import { getButtonPropsByStatus } from "./getButtonPropsByStatus";

export const CodemodButton = () => {
  const { getToken, isSignedIn } = useAuth();

  const [repositoriesToShow, setRepositoriesToShow] = useState<
    GithubRepository[]
  >([]);
  const [selectedRepository, setSelectedRepository] =
    useState<GithubRepository>();

  const [branchesToShow, setBranchesToShow] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>();
  const [targetPathInput, setTargetPathInput] = useState<string>("");
  const [codemodNameInput, setCodemodNameInput] = useState<string>("Untitled");

  const { codemodRunStatus } = useCodemodExecution();

  const {
    showModalWithRepositories,
    hideRepositoryModal,
    isRepositoryModalShown,
  } = useOpenRepoModalAfterSignIn(setRepositoriesToShow);

  const showRepoModalToSignedUser = useEnsureUserSigned(
    showModalWithRepositories,
    "openRepoModal",
  );

  const { text, hintText } = getButtonPropsByStatus(
    codemodRunStatus?.result?.status ?? null,
  );

  const selectRepository = (name: GithubRepository["full_name"]) => {
    setBranchesToShow([]);
    setSelectedRepository(
      repositoriesToShow.find((repo) => repo.full_name === name),
    );
  };

  const selectBranch = (branch: string) =>
    setSelectedBranch(branchesToShow.find((name) => name === branch));

  const handleCodemodRun = useHandleCodemodRun(
    codemodNameInput,
    selectedRepository,
    selectedBranch,
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

      setBranchesToShow(branches.slice().map((branch) => branch.name));
    };

    getBranches();
  }, [getToken, selectedRepository]);

  useEffect(() => {
    if (codemodRunStatus?.result?.status === "error") {
      console.log(
        codemodRunStatus.result.status,
        codemodRunStatus.result.message,
      );
      toast.error(codemodRunStatus.result.message, {
        position: "top-center",
        duration: 12000,
      });
    }
  }, [codemodRunStatus?.result]);

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
      {codemodRunStatus !== null && (
        <ProgressBar codemodRunStatus={codemodRunStatus} />
      )}
      <Button
        onClick={showRepoModalToSignedUser}
        size="xs"
        variant="outline"
        className="flex gap-1"
        hint={
          <p className="font-normal">
            {isSignedIn
              ? hintText
              : "You need to sign in to run codemod on Github repository."}
          </p>
        }
        disabled={
          codemodRunStatus?.result?.status === "executing codemod" ||
          codemodRunStatus?.result?.status === "progress"
        }
      >
        <CheckIcon />
        {text}
      </Button>
    </>
  );
};
