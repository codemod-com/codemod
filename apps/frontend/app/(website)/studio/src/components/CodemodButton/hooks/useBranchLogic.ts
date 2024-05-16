import { useAPI } from "@studio/hooks/useAPI";
import { GH_BRANCH_LIST } from "@utils/apis/endpoints";
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

  const { post: fetchGHBranches } = useAPI(GH_BRANCH_LIST);

  useEffect(() => {
    if (!selectedRepository) {
      setBranchesToShow([]);
      return;
    }

    const getBranches = async () => {
      setAreBranchesLoading(true);
      const branches = (
        await fetchGHBranches<GHBranch[]>({
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
  };
};
