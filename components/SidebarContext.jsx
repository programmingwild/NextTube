"use client";

import { createContext, useContext, useEffect, useState } from "react";

const SidebarContext = createContext({
  isCollapsed: false,
  toggleSidebar: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
  closeMobile: () => {},
});

export function SidebarProvider({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };
  const closeMobile = () => setMobileOpen(false);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <SidebarContext.Provider
      value={{ isCollapsed, toggleSidebar, mobileOpen, setMobileOpen, closeMobile }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);
