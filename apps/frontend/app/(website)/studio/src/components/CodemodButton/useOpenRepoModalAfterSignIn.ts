import { GH_REPO_LIST } from "@studio/constants";
import { useAPI } from "@studio/hooks/useAPI";
import { useAuth } from "@studio/hooks/useAuth";
import { useModal } from "@studio/hooks/useModal";
import { useUserSession } from "@studio/store/zustand/userSession";
import type { GithubRepository } from "be-types";
import { pipe } from "ramda";
import { type Dispatch, type SetStateAction, useEffect } from "react";

/*
When a user is not signed - redirect them to GH sign in.
To show a user a modal with repos after they are redirected back to our page
save this pending action (to open repo modal) in local storage using localStorage (handled by zustant persist middleware)
 */
export const useOpenRepoModalAfterSignIn = (
  setRepositoriesToShow: Dispatch<SetStateAction<GithubRepository[]>>,
) => {
  const { isSignedIn } = useAuth();
  const { get: getRepos } = useAPI<GithubRepository[]>(GH_REPO_LIST);
  const {
    showModal: showRepositoryModal,
    hideModal: hideRepositoryModal,
    isModalShown: isRepositoryModalShown,
  } = useModal();

  const getRepositories = async () => {
    const repositories = ((await getRepos()) as any).repositories.data;
    setRepositoriesToShow(repositories);
  };
  const { retrievePendingAction, hasPendingAction } = useUserSession();

  const showModalWithRepositories = pipe(
    getRepositories,
    async (x) => await x,
    showRepositoryModal,
  );
  const shouldOpenPendingRepoModal = hasPendingAction("openRepoModal");

  useEffect(() => {
    if (shouldOpenPendingRepoModal && isSignedIn) {
      showModalWithRepositories();
      retrievePendingAction("openRepoModal");
    }
  }, [isSignedIn, shouldOpenPendingRepoModal]);

  return {
    showModalWithRepositories,
    hideRepositoryModal,
    isRepositoryModalShown,
  };
};
