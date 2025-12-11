import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIActions, useUIStore } from "@/stores/uiStore";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Tag,
  Box,
  Layers,
  Gift,
  Warehouse,
  Globe,
} from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  shortcut?: string;
  category?: string;
}

const commands: CommandItem[] = [
  { id: "overview", label: "Overview", href: "/", icon: LayoutDashboard, shortcut: "G H", category: "Navigation" },
  { id: "products", label: "Products", href: "/products", icon: Package, shortcut: "G P", category: "Navigation" },
  { id: "collections", label: "Collections", href: "/products/collections", icon: Layers, category: "Products" },
  { id: "categories", label: "Categories", href: "/products/categories", icon: Tag, category: "Products" },
  { id: "variants", label: "Variants", href: "/products/variants", icon: Box, category: "Products" },
  { id: "gift-cards", label: "Gift Cards", href: "/products/gift-cards", icon: Gift, category: "Products" },
  { id: "inventory", label: "Inventory", href: "/products/inventory", icon: Warehouse, category: "Products" },
  { id: "aggregator", label: "Aggregator", href: "/products/aggregator", icon: Globe, shortcut: "G A", category: "Navigation" },
  { id: "orders", label: "Orders", href: "/orders", icon: ShoppingCart, shortcut: "G O", category: "Navigation" },
  { id: "customers", label: "Customers", href: "/customers", icon: Users, shortcut: "G C", category: "Navigation" },
  { id: "users", label: "Users", href: "/users", icon: Users, shortcut: "G U", category: "Navigation" },
  { id: "settings", label: "Settings", href: "/settings", icon: Settings, shortcut: "G S", category: "Navigation" },
];

export const CommandPalette = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isOpen = useUIStore((state) => state.isCommandPaletteOpen);
  const { setCommandPaletteOpen } = useUIActions();
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredCommands = useMemo(() => {
    if (!search) return commands;
    return commands.filter((cmd) =>
      cmd.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleSelect = (item: CommandItem) => {
    navigate(item.href);
    setCommandPaletteOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % filteredCommands.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + filteredCommands.length) % filteredCommands.length);
        break;
      case "Enter":
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          handleSelect(filteredCommands[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setCommandPaletteOpen(false);
        break;
    }
  };

  if (!isOpen) return null;

  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
        onClick={() => setCommandPaletteOpen(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] pointer-events-none">
        <div
          className="w-full max-w-2xl rounded-lg border border-border bg-card shadow-2xl pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search pages and commands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              onClick={() => setCommandPaletteOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto p-2">
            {filteredCommands.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No results found
              </div>
            ) : (
              <div className="space-y-1">
                {filteredCommands.map((item, index) => {
                  const isSelected = index === selectedIndex;
                  const isActive = location.pathname === item.href;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        "w-full flex items-center justify-between gap-3 rounded-md px-3 py-2 text-left transition-colors",
                        isSelected
                          ? "bg-muted text-foreground"
                          : "hover:bg-muted/50 text-muted-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <div>
                          <div className="text-sm font-medium">{item.label}</div>
                          {item.category && (
                            <div className="text-xs text-muted-foreground">
                              {item.category}
                            </div>
                          )}
                        </div>
                      </div>
                      {item.shortcut && (
                        <kbd className="hidden sm:inline-block rounded border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {isMac ? item.shortcut.replace("G", "⌘") : item.shortcut}
                        </kbd>
                      )}
                      {isActive && (
                        <div className="h-1.5 w-1.5 rounded-full bg-foreground" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-4 py-2 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">↑↓</kbd>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">↵</kbd>
              <span>Select</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">Esc</kbd>
              <span>Close</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
