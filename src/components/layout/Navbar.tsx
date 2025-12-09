import { Bell, Search, Settings } from "lucide-react";
import { Breadcrumbs } from "../ui/Breadcrumbs";
import { Link } from "react-router";
import { useUIActions } from "@/stores/uiStore";

export const Navbar = () => {
  const { setCommandPaletteOpen } = useUIActions();

  return (
    <header className="flex h-14 items-center justify-between border-b border-(--color-border) bg-(--color-background) px-8">
      <div className="flex items-center gap-4">
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 rounded-md border border-(--color-border) bg-(--color-muted)/30 px-3 py-1.5 text-sm text-muted-foreground hover:bg-(--color-muted)/50 hover:text-(--color-foreground) transition-colors w-64"
        >
          <Search className="h-4 w-4" />
          <span>Search...</span>
          <kbd className="ml-auto text-[10px] border border-(--color-border) rounded px-1">
            ⌘K
          </kbd>
        </button>

        <div className="flex items-center gap-2">
          <button className="rounded-full p-2 text-muted-foreground hover:bg-(--color-muted) hover:text-(--color-foreground) transition-colors">
            <Bell className="h-5 w-5" />
          </button>
          <Link to="/settings">
            <button className="rounded-full p-2 text-muted-foreground hover:bg-(--color-muted) hover:text-(--color-foreground) transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </Link>
          <div className="h-8 w-8 rounded-full bg-(--color-primary) text-(--color-primary-foreground) flex items-center justify-center text-sm font-medium">
            A
          </div>
        </div>
      </div>
    </header>
  );
};
