import { useEffect } from "react";
import { Command } from "cmdk";
import { useNavigate } from "react-router";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Search,
  ArrowRight,
  Layers,
  Gift,
  Warehouse,
  Tag,
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CommandPalette = ({ open, onOpenChange }: CommandPaletteProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const runCommand = (command: () => void) => {
    onOpenChange(false);
    command();
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Global Command Menu"
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
    >
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-(--color-border) bg-(--color-card) shadow-2xl animate-in fade-in zoom-in-95 duration-100">
        <div className="flex items-center border-b border-(--color-border) px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Command.Input
            placeholder="Type a command or search..."
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
          <Command.Empty className="py-6 text-center text-sm">No results found.</Command.Empty>
          
          <Command.Group heading="Navigation" className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            <Command.Item
              onSelect={() => runCommand(() => navigate("/"))}
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-(--color-accent) aria-selected:text-(--color-accent-foreground) data-disabled:pointer-events-none data-disabled:opacity-50"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Overview</span>
              <span className="ml-auto text-xs tracking-widest text-muted-foreground">
                G H
              </span>
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => navigate("/products"))}
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-(--color-accent) aria-selected:text-(--color-accent-foreground) data-disabled:pointer-events-none data-disabled:opacity-50"
            >
              <Package className="mr-2 h-4 w-4" />
              <span>Products</span>
              <span className="ml-auto text-xs tracking-widest text-muted-foreground">
                G P
              </span>
            </Command.Item>
             <Command.Item
              onSelect={() => runCommand(() => navigate("/collections"))}
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-(--color-accent) aria-selected:text-(--color-accent-foreground) data-disabled:pointer-events-none data-disabled:opacity-50"
            >
              <Layers className="mr-2 h-4 w-4" />
              <span>Collections</span>
            </Command.Item>
             <Command.Item
              onSelect={() => runCommand(() => navigate("/products/categories"))}
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-(--color-accent) aria-selected:text-(--color-accent-foreground) data-disabled:pointer-events-none data-disabled:opacity-50"
            >
              <Tag className="mr-2 h-4 w-4" />
              <span>Categories</span>
            </Command.Item>
             <Command.Item
              onSelect={() => runCommand(() => navigate("/products/gift-cards"))}
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-(--color-accent) aria-selected:text-(--color-accent-foreground) data-disabled:pointer-events-none data-disabled:opacity-50"
            >
              <Gift className="mr-2 h-4 w-4" />
              <span>Gift Cards</span>
            </Command.Item>
             <Command.Item
              onSelect={() => runCommand(() => navigate("/products/inventory"))}
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-(--color-accent) aria-selected:text-(--color-accent-foreground) data-disabled:pointer-events-none data-disabled:opacity-50"
            >
              <Warehouse className="mr-2 h-4 w-4" />
              <span>Inventory</span>
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => navigate("/orders"))}
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-(--color-accent) aria-selected:text-(--color-accent-foreground) data-disabled:pointer-events-none data-disabled:opacity-50"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              <span>Orders</span>
              <span className="ml-auto text-xs tracking-widest text-muted-foreground">
                G O
              </span>
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => navigate("/customers"))}
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-(--color-accent) aria-selected:text-(--color-accent-foreground) data-disabled:pointer-events-none data-disabled:opacity-50"
            >
              <Users className="mr-2 h-4 w-4" />
              <span>Customers</span>
              <span className="ml-auto text-xs tracking-widest text-muted-foreground">
                G C
              </span>
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => navigate("/settings"))}
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-(--color-accent) aria-selected:text-(--color-accent-foreground) data-disabled:pointer-events-none data-disabled:opacity-50"
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <span className="ml-auto text-xs tracking-widest text-muted-foreground">
                G S
              </span>
            </Command.Item>
          </Command.Group>

          <Command.Separator className="my-1 h-px bg-(--color-border)" />

          <Command.Group heading="Quick Actions" className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
             <Command.Item
              onSelect={() => runCommand(() => navigate("/products/new"))}
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-(--color-accent) aria-selected:text-(--color-accent-foreground) data-disabled:pointer-events-none data-disabled:opacity-50"
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              <span>Create Product</span>
            </Command.Item>
          </Command.Group>
        </Command.List>
      </div>
    </Command.Dialog>
  );
};
