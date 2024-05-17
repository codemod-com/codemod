import { useAuth } from "@clerk/nextjs";
import { useAPI } from "@studio/hooks/useAPI";
import { useModal } from "@studio/hooks/useModal";
import { useUserSession } from "@studio/store/zustand/userSession";
import { GH_REPO_LIST } from "@utils/apis/endpoints";
import type { GithubRepository } from "be-types";
import { pipe } from "ramda";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";

/*
When a user is not signed - redirect them to GH sign in.
To show a user a modal with repos after they are redirected back to our page
save this pending action (to open repo modal) in local storage using localStorage (handled by zustant persist middleware)
 */
export let useOpenRepoModalAfterSignIn = (
  setRepositoriesToShow: Dispatch<SetStateAction<GithubRepository[]>>,
) => {
  let [areReposLoading, setAreReposLoading] = useState(false);
  let { isSignedIn } = useAuth();
  let { get: getRepos } = useAPI<GithubRepository[]>(GH_REPO_LIST);
  let {
    showModal: showRepositoryModal,
    hideModal: hideRepositoryModal,
    isModalShown: isRepositoryModalShown,
  } = useModal();

  let getRepositories = async () => {
    setAreReposLoading(true);
    let ghRepos = (await getRepos()).data;
    setRepositoriesToShow(ghRepos);
    setAreReposLoading(false);
  };
  let { retrievePendingAction, hasPendingAction } = useUserSession();

  let showModalWithRepositories = pipe(
    getRepositories,
    async (x) => await x,
    showRepositoryModal,
  );
  let shouldOpenPendingRepoModal = hasPendingAction("openRepoModal");

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
    areReposLoading,
  };
};
