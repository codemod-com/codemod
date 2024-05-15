import { useAuth } from "@/app/auth/useAuth";
import { GH_BRANCH_LIST } from "@/utils/apis/endpoints";
import type { GithubBranch } from "@codemod-com/utilities";
import { Check as CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { ProgressBar } from "@studio/components/CodemodButton/ProgressBar";
import { useHandleCodemodRun } from "@studio/components/CodemodButton/useHandleCodemodRun";
import { useOpenRepoModalAfterSignIn } from "@studio/components/CodemodButton/useOpenRepoModalAfterSignIn";
import { Button } from "@studio/components/ui/button";
import { useCodemodExecution } from "@studio/hooks/useCodemodExecution";
import { useEnsureUserSigned } from "@studio/hooks/useEnsureUserSigned";
import { useModal } from "@studio/hooks/useModal";
import type { GithubRepository } from "be-types";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAPI } from "../../hooks/useAPI";
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
    showModal: showRepositoryModal,
    hideModal: hideRepositoryModal,
    isModalShown: isRepositoryModalShown,
  } = useModal();

  // const {
  //   showModalWithRepositories,
  //   hideRepositoryModal,
  //   isRepositoryModalShown,
  // } = useOpenRepoModalAfterSignIn(setRepositoriesToShow);
  //
  // const showRepoModalToSignedUser = useEnsureUserSigned(
  //   showModalWithRepositories,
  //   "openRepoModal",
  // );

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

  const { post: fetchGHBranches } = useAPI(GH_BRANCH_LIST);

  useEffect(() => {
    if (!selectedRepository) {
      return;
    }

    const getBranches = async () => {
      const branches = (
        await fetchGHBranches<GithubBranch[]>({
          repoUrl: selectedRepository.html_url,
        })
      ).data;

      setBranchesToShow(branches.slice().map((branch) => branch.name));
    };

    getBranches();
  }, [fetchGHBranches, selectedRepository]);

  useEffect(() => {
    const result = codemodRunStatus?.result;
    if (!result) {
      return;
    }

    if (result.status === "error") {
      toast(`❌ ${result.message}`, {
        position: "top-center",
        duration: 12000,
      });
    } else if (result.status === "done") {
      toast.success(
        () => {
          return (
            <span>
              Success! Check out the changes{" "}
              <a
                href={result.link}
                target="_blank"
                rel="noreferrer"
                className="text-primary-light text-decoration-line"
              >
                here
              </a>
            </span>
          );
        },
        {
          position: "top-center",
          duration: 12000,
        },
      );
    }
  }, [codemodRunStatus?.result]);

  return (
    <>
      <RepositoryModal
        hideRepositoryModal={() => {
          hideRepositoryModal();
          setSelectedRepository(undefined);
        }}
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
        onClick={showRepositoryModal}
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
