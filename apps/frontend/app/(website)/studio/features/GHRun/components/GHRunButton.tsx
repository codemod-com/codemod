import { useUser } from "@clerk/nextjs";
import {
  ProgressBar,
  getButtonPropsByStatus,
  useExecutionStatus,
  useOpenRepoModalAfterSignIn,
} from "@features/GHRun";
import { Check as CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { Button } from "@studio/components/ui/button";
import { useEnsureUserSigned } from "@studio/hooks/useEnsureUserSigned";
import { useLocalStorage } from "@studio/hooks/useLocalStorage";
import type { GHBranch, GithubRepository } from "be-types";
import { useRouter } from "next/navigation";
import { type MouseEvent, memo, useState } from "react";
import { useCodemodExecution } from "../hooks/useCodemodExecution";
import { RepositoryModal } from "./RepositoryModal";
export const GHRunButton = memo(() => {
  const { user } = useUser();
  const router = useRouter();

  const [repositoriesToShow, setRepositoriesToShow] = useState<
    GithubRepository[]
  >([]);

  const [codemodExecutionId, setCodemodExecutionId, clearExecutionId] =
    useLocalStorage("codemodExecutionId");
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

  const codemodRunStatus = useExecutionStatus({
    codemodExecutionId,
    clearExecutionId,
  });
  const status = codemodRunStatus?.result?.status ?? null;
  const { text, hintText } = getButtonPropsByStatus(status);
  const { onCodemodRun } = useCodemodExecution({
    codemodExecutionId,
    setCodemodExecutionId,
  });

  const redirectToRequestMoreScopes = async (
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    const githubAccount = user?.externalAccounts.find(
      (account) => account.provider === "github",
    );

    if (!githubAccount) {
      return;
    }

    if (githubAccount.approvedScopes.includes("repo")) {
      showRepoModalToSignedUser(event);
      return;
    }

    try {
      const res = await githubAccount.reauthorize({
        redirectUrl: window.location.href,
        additionalScopes: ["repo"],
      });
      if (res.verification?.externalVerificationRedirectURL) {
        router.push(res.verification.externalVerificationRedirectURL.href);
        return;
      }

      throw new Error("externalVerificationRedirectURL not found");
    } catch (err) {
      console.log("ERROR:", err);
    }
  };

  return (
    <>
      <RepositoryModal
        onCodemodRun={onCodemodRun}
        branchesToShow={branchesToShow}
        setBranchesToShow={setBranchesToShow}
        hideRepositoryModal={hideRepositoryModal}
        isRepositoryModalShown={isRepositoryModalShown}
        repositoriesToShow={repositoriesToShow}
        areReposLoading={areReposLoading}
      />
      {codemodRunStatus && <ProgressBar codemodRunStatus={codemodRunStatus} />}
      <Button
        onClick={redirectToRequestMoreScopes}
        size="xs"
        variant="outline"
        className="flex gap-1"
        hint={<p className="font-normal">{hintText}</p>}
        disabled={status === "executing codemod" || status === "progress"}
      >
        <CheckIcon />
        {text}
      </Button>
    </>
  );
});

GHRunButton.displayName = "GHRunButton";
