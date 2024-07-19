import { useUser } from "@clerk/nextjs";
import type { GHBranch, GithubRepository } from "@codemod-com/api-types";
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
import { useRouter } from "next/navigation";
import { type MouseEvent, memo, useState } from "react";
import { useModal } from "../../../src/hooks/useModal";
import { useCodemodExecution } from "../hooks/useCodemodExecution";
import { RepositoryModal } from "./RepositoryModal";
import { UserPromptModal } from "./UserPromptModal";

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

  const {
    showModal: showUserPromptModal,
    hideModal: hideUserPromptModal,
    isModalShown: isUserPromptModalShown,
  } = useModal();

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

  const handlePress = (event: MouseEvent<HTMLButtonElement>) => {
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
    showUserPromptModal();
  };

  const onApprove = async () => {
    const githubAccount = user?.externalAccounts.find(
      (account) => account.provider === "github",
    );

    if (!githubAccount) {
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
      <UserPromptModal
        isModalShown={isUserPromptModalShown}
        onApprove={onApprove}
        onReject={hideUserPromptModal}
      />
      {codemodRunStatus && <ProgressBar codemodRunStatus={codemodRunStatus} />}
      <Button
        onClick={handlePress}
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
