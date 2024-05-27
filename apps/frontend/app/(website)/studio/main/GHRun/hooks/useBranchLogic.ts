import { GH_BRANCH_LIST } from "@shared/endpoints";
import { useAPI } from "@studio/hooks/useAPI";
import type { GHBranch, GithubRepository } from "be-types";
import { useEffect, useState } from "react";

type UseBranchLogicProps = {
  branchesToShow: GHBranch[];
  setBranchesToShow: React.Dispatch<React.SetStateAction<GHBranch[]>>;
  selectedRepository?: GithubRepository;
};
export const useBranchLogic = ({
  branchesToShow,
  setBranchesToShow,
  selectedRepository,
}: UseBranchLogicProps) => {
  const [selectedBranch, setSelectedBranch] = useState<GHBranch>();
  const [areBranchesLoading, setAreBranchesLoading] = useState(false);

  const { post: fetchGHBranches } = useAPI<GHBranch[]>(GH_BRANCH_LIST);

  useEffect(() => {
    if (!selectedRepository) {
      setBranchesToShow([]);
      return;
    }

    const getBranches = async () => {
      setAreBranchesLoading(true);
      const branches = (
        await fetchGHBranches({
          repoUrl: selectedRepository.html_url,
        })
      ).data;

      setBranchesToShow(branches);
      setAreBranchesLoading(false);
    };

    getBranches();
  }, [selectedRepository]);

  const selectBranch = (branchName: string) => {
    const branch = branchesToShow.find(({ name }) => name === branchName);
    setSelectedBranch(branch);
  };

  return {
    selectedBranch,
    selectBranch,
    isFetching: areBranchesLoading,
    setSelectedBranch,
  };
};
