import { GH_BRANCH_LIST } from "@shared/endpoints";
import { useAPI } from "@studio/hooks/useAPI";
import type { GHBranch, GithubRepository } from "be-types";
import { useEffect, useState } from "react";

type UseBranchLogicProps = {
  branchesToShow: GHBranch[];
  setBranchesToShow: React.Dispatch<React.SetStateAction<GHBranch[]>>;
  selectedRepository?: GithubRepository;
};
export let useBranchLogic = ({
  branchesToShow,
  setBranchesToShow,
  selectedRepository,
}: UseBranchLogicProps) => {
  let [selectedBranch, setSelectedBranch] = useState<GHBranch>();
  let [areBranchesLoading, setAreBranchesLoading] = useState(false);

  let { post: fetchGHBranches } = useAPI<GHBranch[]>(GH_BRANCH_LIST);

  useEffect(() => {
    if (!selectedRepository) {
      setBranchesToShow([]);
      return;
    }

    let getBranches = async () => {
      setAreBranchesLoading(true);
      let branches = (
        await fetchGHBranches({
          repoUrl: selectedRepository.html_url,
        })
      ).data;

      setBranchesToShow(branches);
      setAreBranchesLoading(false);
    };

    getBranches();
  }, [selectedRepository]);

  let selectBranch = (branchName: string) => {
    let branch = branchesToShow.find(({ name }) => name === branchName);
    setSelectedBranch(branch);
  };

  return {
    selectedBranch,
    selectBranch,
    isFetching: areBranchesLoading,
    setSelectedBranch,
  };
};
