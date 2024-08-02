import { create } from "zustand";

type ViewState = {
  isSidebarActive: boolean;
  insightsSearchTerm: string;
  toggleSidebar: () => void;
  setInsightsSearchTerm: (searchTerm: string) => void;
};

export const useViewStore = create<ViewState>((set) => ({
  isSidebarActive: true,
  insightsSearchTerm: "",
  toggleSidebar: () =>
    set(({ isSidebarActive }) => ({ isSidebarActive: !isSidebarActive })),
  setInsightsSearchTerm: (searchTerm: string) =>
    set(() => ({ insightsSearchTerm: searchTerm })),
}));
