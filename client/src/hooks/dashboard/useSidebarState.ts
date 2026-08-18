import { useEffect, useState } from "react";

const STORAGE_KEY = "kanban:sidebar-collapsed";

export function useSidebarState() {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  const toggle = () => {
    setCollapsed((current) => !current);
  };

  return {
    collapsed,
    setCollapsed,
    toggle,
  };
}
