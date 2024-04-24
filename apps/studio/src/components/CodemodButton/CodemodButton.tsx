import { Check as CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { GithubRepository } from "be-types";
import { useState } from "react";
import { ProgressBar } from "~/components/CodemodButton/ProgressBar";
import { useHandleCodemodRun } from "~/components/CodemodButton/useHandleCodemodRun";
import { useOpenRepoModalAfterSignIn } from "~/components/CodemodButton/useOpenRepoModalAfterSignIn";
import { Button } from "~/components/ui/button";
import { useCodemodExecution } from "~/hooks/useCodemodExecution";
import { useEnsureUserSigned } from "~/hooks/useEnsureUserSigned";
import { RepositoryModal } from "./RepositoryModal";
import { getButtonPropsByStatus } from "./getButtonPropsByStatus";

export const CodemodButton = () => {
  const [repositoriesToShow, setRepositoriesToShow] = useState<
    GithubRepository[]
  >([]);

  const [selectedRepository, setSelectedRepository] =
    useState<GithubRepository>();

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

  const handleCodemodRun = useHandleCodemodRun(selectedRepository);

  return (
    <>
      <RepositoryModal
        hideRepositoryModal={hideRepositoryModal}
        isRepositoryModalShown={isRepositoryModalShown}
        repositoriesToShow={repositoriesToShow}
        selectRepository={selectRepository}
        selectedRepository={selectedRepository}
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
