import { create } from "zustand";

type ViewState = {
  isSidebarActive: boolean;
  insightsSearchTerm: string;
  selectedRepos: string[];
  toggleSidebar: () => void;
  setInsightsSearchTerm: (searchTerm: string) => void;
  setSelectedRepos: (repos: string[]) => void;
};

export const useViewStore = create<ViewState>((set) => ({
  isSidebarActive: true,
  insightsSearchTerm: "",
  selectedRepos: [],
  toggleSidebar: () =>
    set(({ isSidebarActive }) => ({ isSidebarActive: !isSidebarActive })),
  setInsightsSearchTerm: (searchTerm: string) =>
    set(() => ({ insightsSearchTerm: searchTerm })),
  setSelectedRepos: (repos: string[]) => set(() => ({ selectedRepos: repos })),
}));
