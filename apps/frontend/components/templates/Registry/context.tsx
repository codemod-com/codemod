"use client";

import React, { createContext, useContext, useState } from "react";

let SidebarContext = createContext<{
  mobileOpen: boolean;
  desktopOpen: boolean;
  toggleSidebar: () => void;
}>({
  mobileOpen: false,
  desktopOpen: true,
  toggleSidebar: () => {},
});

export let SidebarProvider = ({ children }) => {
  let [mobileOpen, setMobileOpen] = useState(false);
  let [desktopOpen, setDesktopOpen] = useState(true);

  let toggleSidebar = () => {
    setMobileOpen(!mobileOpen);
    setDesktopOpen(!desktopOpen);
  };

  return (
    <SidebarContext.Provider value={{ desktopOpen, mobileOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

export let useSidebar = () => {
  let { desktopOpen, mobileOpen, toggleSidebar } = useContext(SidebarContext);
  return { desktopOpen, mobileOpen, toggleSidebar };
};
