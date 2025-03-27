import { create } from "zustand";

export enum TabNames {
  MODGPT = "MODGPT",
  GUIBuilder = "FIND_AND_REPLACE",
  DEBUG = "DEBUG_CONSOLE",
  AST = "AST",
  INFERRER = "INFERRER",
}

type ViewState = {
  activateModGpt: () => void;
  activeTab: TabNames;
  astViewCollapsed: boolean;
  setActiveTab: (tab: TabNames) => void;
  setASTViewCollapsed: (collapsed: boolean) => void;
};

export const useViewStore = create<ViewState>((set, get) => ({
  activeTab: TabNames.MODGPT,
  astViewCollapsed: true,
  activateModGpt: () => get().setActiveTab(TabNames.MODGPT),
  setActiveTab: (tab) => set(() => ({ activeTab: tab })),
  setASTViewCollapsed: (collapsed) =>
    set(() => ({ astViewCollapsed: collapsed })),
}));
