import { create } from "zustand";

interface UIState {
  isSidebarCollapsed: boolean;
  isCommandPaletteOpen: boolean;
  expandedSidebarItems: string[];
  actions: {
    toggleSidebar: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    setCommandPaletteOpen: (open: boolean) => void;
    toggleSidebarItem: (name: string) => void;
  };
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarCollapsed: false,
  isCommandPaletteOpen: false,
  expandedSidebarItems: ["Products"], // Default expanded
  actions: {
    toggleSidebar: () =>
      set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
    setSidebarCollapsed: (collapsed) =>
      set(() => ({ isSidebarCollapsed: collapsed })),
    setCommandPaletteOpen: (open) =>
      set(() => ({ isCommandPaletteOpen: open })),
    toggleSidebarItem: (name) =>
      set((state) => ({
        expandedSidebarItems: state.expandedSidebarItems.includes(name)
          ? state.expandedSidebarItems.filter((item) => item !== name)
          : [...state.expandedSidebarItems, name],
      })),
  },
}));

export const useUIActions = () => useUIStore((state) => state.actions);
