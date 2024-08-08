import { create } from "zustand";

type ViewState = {
  isSidebarActive: boolean;
  campaignsSearchTerm: string;
  toggleSidebar: () => void;
  setInsightsSearchTerm: (searchTerm: string) => void;
};

export const useViewStore = create<ViewState>((set) => ({
  isSidebarActive: true,
  campaignsSearchTerm: "",
  toggleSidebar: () =>
    set(({ isSidebarActive }) => ({ isSidebarActive: !isSidebarActive })),
  setInsightsSearchTerm: (searchTerm: string) =>
    set(() => ({ campaignsSearchTerm: searchTerm })),
}));
