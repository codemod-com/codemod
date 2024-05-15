import { Check as CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { ProgressBar } from "@studio/components/CodemodButton/ProgressBar";
import { useCodemodStatusToast } from "@studio/components/CodemodButton/hooks/useCodemodStatusToast";
import { useOpenRepoModalAfterSignIn } from "@studio/components/CodemodButton/hooks/useOpenRepoModalAfterSignIn";
import { Button } from "@studio/components/ui/button";
import { useCodemodExecution } from "@studio/hooks/useCodemodExecution";
import { useEnsureUserSigned } from "@studio/hooks/useEnsureUserSigned";
import type { GHBranch, GithubRepository } from "be-types";
import { useState } from "react";
import { RepositoryModal } from "./RepositoryModal";
import { getButtonPropsByStatus } from "./getButtonPropsByStatus";

export const CodemodButton = () => {
  const [repositoriesToShow, setRepositoriesToShow] = useState<
    GithubRepository[]
  >([]);

  const [branchesToShow, setBranchesToShow] = useState<GHBranch[]>([]);

  const {
    showModalWithRepositories,
    hideRepositoryModal,
    isRepositoryModalShown,
    areReposLoading,
  } = useOpenRepoModalAfterSignIn(setRepositoriesToShow);

  const showRepoModalToSignedUser = useEnsureUserSigned(
    showModalWithRepositories,
    "openRepoModal",
  );

  const { codemodRunStatus } = useCodemodExecution();
  const { text, hintText } = getButtonPropsByStatus(
    codemodRunStatus?.result?.status ?? null,
  );

  useCodemodStatusToast(codemodRunStatus);

  return (
    <>
      <RepositoryModal
        branchesToShow={branchesToShow}
        setBranchesToShow={setBranchesToShow}
        hideRepositoryModal={hideRepositoryModal}
        isRepositoryModalShown={isRepositoryModalShown}
        repositoriesToShow={repositoriesToShow}
        areReposLoading={areReposLoading}
      />
      {codemodRunStatus !== null && (
        <ProgressBar codemodRunStatus={codemodRunStatus} />
      )}
      <Button
        onClick={showRepoModalToSignedUser}
        size="xs"
        variant="outline"
        className="flex gap-1"
        hint={<p className="font-normal">{hintText}</p>}
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
