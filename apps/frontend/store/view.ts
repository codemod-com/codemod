import { create } from "zustand";

type ViewState = {
  isSidebarActive: boolean;
  campaignsSearchTerm: string;
  selectedRepos: string[];
  toggleSidebar: () => void;
  setInsightsSearchTerm: (searchTerm: string) => void;
  setSelectedRepos: (repos: string[]) => void;
};

export const useViewStore = create<ViewState>((set) => ({
  isSidebarActive: true,
  campaignsSearchTerm: "",
  selectedRepos: [],
  toggleSidebar: () =>
    set(({ isSidebarActive }) => ({ isSidebarActive: !isSidebarActive })),
  setInsightsSearchTerm: (searchTerm: string) =>
    set(() => ({ campaignsSearchTerm: searchTerm })),
  setSelectedRepos: (repos: string[]) => set(() => ({ selectedRepos: repos })),
}));
