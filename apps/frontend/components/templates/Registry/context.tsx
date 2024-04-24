"use client";

import { createContext, useContext, useState } from "react";

const SidebarContext = createContext<{
  mobileOpen: boolean;
  desktopOpen: boolean;
  toggleSidebar: () => void;
}>({
  mobileOpen: false,
  desktopOpen: true,
  toggleSidebar: () => {},
});

export const SidebarProvider = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);

  const toggleSidebar = () => {
    setMobileOpen(!mobileOpen);
    setDesktopOpen(!desktopOpen);
  };

  return (
    <SidebarContext.Provider value={{ desktopOpen, mobileOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const { desktopOpen, mobileOpen, toggleSidebar } = useContext(SidebarContext);
  return { desktopOpen, mobileOpen, toggleSidebar };
};
