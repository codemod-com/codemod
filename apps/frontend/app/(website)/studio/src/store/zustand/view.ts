import create from "zustand";

export enum TabNames {
  MODGPT = "MODGPT",
  GUIBuilder = "FIND_AND_REPLACE",
  DEBUG = "DEBUG_CONSOLE",
  AST = "AST",
}

type ViewState = {
  activeTab: TabNames;
  astViewCollapsed: boolean;
  setActiveTab: (tab: TabNames) => void;
  setASTViewCollapsed: (collapsed: boolean) => void;
};

export let useViewStore = create<ViewState>((set) => ({
  activeTab: TabNames.MODGPT,
  astViewCollapsed: true,
  setActiveTab: (tab) => set(() => ({ activeTab: tab })),
  setASTViewCollapsed: (collapsed) =>
    set(() => ({ astViewCollapsed: collapsed })),
}));
