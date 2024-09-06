import { create } from "zustand";

type ViewState = {
  isResizing: boolean;
  setIsResizing: (isResizing: boolean) => void;
  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
  isSidebarActive: boolean;
  setIsSidebarActive: (isSidebarActive: boolean) => void;
  insightsSearchTerm: string;
  selectedRepos: string[];
  toggleSidebar: () => void;
  setInsightsSearchTerm: (searchTerm: string) => void;
  setSelectedRepos: (repos: string[]) => void;
};

export const useViewStore = create<ViewState>((set) => ({
  isSidebarActive: true,
  setIsSidebarActive: (isSidebarActive: boolean) =>
    set(() => ({ isSidebarActive })),
  isDragging: false,
  setIsDragging: (isDragging: boolean) => set(() => ({ isDragging })),
  isResizing: false,
  setIsResizing: (isResizing: boolean) => set(() => ({ isResizing })),
  insightsSearchTerm: "",
  selectedRepos: [],
  toggleSidebar: () =>
    set(({ isSidebarActive }) => ({ isSidebarActive: !isSidebarActive })),
  setInsightsSearchTerm: (searchTerm: string) =>
    set(() => ({ insightsSearchTerm: searchTerm })),
  setSelectedRepos: (repos: string[]) => set(() => ({ selectedRepos: repos })),
}));
