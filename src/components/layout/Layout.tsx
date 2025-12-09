import { useEffect } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { Sidebar } from "./Sidebar";
import { CommandPalette } from "./CommandPalette";
import { Navbar } from "./Navbar";
import { useUIActions, useUIStore } from "@/stores/uiStore";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const isCommandPaletteOpen = useUIStore((state) => state.isCommandPaletteOpen);
  const { setCommandPaletteOpen } = useUIActions();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Navigation shortcuts (g + key)
      if (e.key === "g") {
        const nextKey = (event: KeyboardEvent) => {
          switch (event.key) {
            case "h":
              navigate("/");
              break;
            case "p":
              navigate("/products");
              break;
            case "o":
              navigate("/orders");
              break;
            case "c":
              navigate("/customers");
              break;
            case "s":
              navigate("/settings");
              break;
          }
          window.removeEventListener("keydown", nextKey);
        };
        window.addEventListener("keydown", nextKey);
        setTimeout(() => window.removeEventListener("keydown", nextKey), 2000);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-(--color-foreground)">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-8">{children}</div>
      </main>
      <CommandPalette
        open={isCommandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />
    </div>
  );
};
