import { Link, useLocation, useNavigate } from "react-router";
import { useGetIdentity } from "@refinedev/core"; // Removed useLogout
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  Tag,
  Box,
  Layers,
  Gift,
  Warehouse,
  Globe,
  PanelLeftClose,
  PanelLeftOpen,
  Sun, // Added for theme toggle
  Moon, // Added for theme toggle
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useUIActions, useUIStore } from "@/stores/uiStore";
import { useTheme } from "@/context/ThemeContext"; // Added for theme toggle
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Added for dropdown menu
import { authProvider } from "../../providers/authProvider"; // Added direct import of authProvider

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  shortcut?: string;
  children?: {
    name: string;
    href: string;
    icon?: LucideIcon;
  }[];
}

const navigation: NavItem[] = [
  { name: "Overview", href: "/", icon: LayoutDashboard, shortcut: "g h" },
  {
    name: "Products",
    href: "/products",
    icon: Package,
    shortcut: "g p",
    children: [
      { name: "All Products", href: "/products" },
      { name: "Collections", href: "/collections", icon: Layers },
      { name: "Categories", href: "/products/categories", icon: Tag },
      { name: "Variants", href: "/products/variants", icon: Box },
      { name: "Gift Cards", href: "/products/gift-cards", icon: Gift },
      { name: "Inventory", href: "/products/inventory", icon: Warehouse },
      { name: "Aggregator", href: "/products/aggregator", icon: Globe },
    ],
  },
  { name: "Orders", href: "/orders", icon: ShoppingCart, shortcut: "g o" },
  { name: "Customers", href: "/customers", icon: Users, shortcut: "g c" },
  { name: "Settings", href: "/settings", icon: Settings, shortcut: "g s" },
];

export const Sidebar = () => {
  const { data: user } = useGetIdentity<{
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  }>();
  // const { mutate: logout } = useLogout(); // Removed useLogout
  const { theme, setTheme } = useTheme(); // Initialized useTheme
  const navigate = useNavigate(); // Initialize useNavigate

  const location = useLocation();
  const isCollapsed = useUIStore((state) => state.isSidebarCollapsed);
  const expanded = useUIStore((state) => state.expandedSidebarItems);
  const { toggleSidebar, toggleSidebarItem, setSidebarCollapsed } =
    useUIActions();

  const handleToggleExpand = (name: string) => {
    if (isCollapsed) return;
    toggleSidebarItem(name);
  };

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r border-(--color-border) bg-(--color-card) text-sm transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo & Toggle */}
      <div className="flex h-14 items-center justify-between border-b border-(--color-border) px-4">
        {!isCollapsed && (
          <div className="flex items-center gap-2 font-semibold animate-in fade-in duration-300">
            <div className="h-6 w-6 rounded bg-black text-white flex items-center justify-center text-xs">
              N
            </div>
            <span>Nexus Commerce</span>
          </div>
        )}
        {isCollapsed && (
          <div className="h-6 w-6 rounded bg-black text-white flex items-center justify-center text-xs mx-auto">
            N
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            "text-muted-foreground hover:text-(--color-foreground) transition-colors",
            isCollapsed &&
              "hidden group-hover:block absolute right-[-12px] top-4 bg-background border border-border rounded-full p-1 shadow-sm z-50" // Optional floating button logic if needed, but for now keeping it simple
          )}
        >
          {isCollapsed ? null : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {/* Collapsed Toggle (if hidden above) - actually let's just put a toggle at the bottom or top.
          Let's make the header simpler: Logo on left, toggle on right. When collapsed, just toggle centered?
          Or maybe a dedicated toggle button at the bottom of the sidebar.
      */}
      {isCollapsed && (
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="flex w-full items-center justify-center py-4 text-muted-foreground hover:text-(--color-foreground)"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto overflow-x-hidden">
        {navigation.map((item) => {
          const isActive =
            location.pathname === item.href ||
            item.children?.some((child) => location.pathname === child.href);
          const isExpanded = expanded.includes(item.name);
          const hasChildren = item.children && item.children.length > 0;

          return (
            <div key={item.name} className="space-y-1">
              <div
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 font-medium transition-colors cursor-pointer",
                  isActive && !hasChildren
                    ? "bg-(--color-muted) text-(--color-foreground)"
                    : "text-muted-foreground hover:bg-(--color-muted) hover:text-(--color-foreground)",
                  isCollapsed ? "justify-center px-2" : "justify-between"
                )}
                onClick={() => {
                  if (hasChildren && !isCollapsed) {
                    handleToggleExpand(item.name);
                  } else if (isCollapsed) {
                    setSidebarCollapsed(false); // Auto expand if clicking an item in collapsed mode? Or maybe show tooltip. For now, expand.
                    if (hasChildren) handleToggleExpand(item.name);
                  }
                }}
              >
                <Link
                  to={hasChildren ? "#" : item.href}
                  className={cn(
                    "flex items-center gap-3",
                    isCollapsed && "justify-center"
                  )}
                  onClick={(e) => {
                    if (hasChildren) e.preventDefault();
                  }}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>

                {!isCollapsed && hasChildren && (
                  <div className="text-muted-foreground">
                    {isExpanded ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </div>
                )}

                {!isCollapsed && !hasChildren && item.shortcut && (
                  <kbd className="hidden text-[10px] text-muted-foreground group-hover:inline-block border border-(--color-border) rounded px-1">
                    {item.shortcut}
                  </kbd>
                )}
              </div>

              {!isCollapsed && hasChildren && isExpanded && (
                <div className="ml-4 space-y-1 border-l border-(--color-border) pl-2 animate-in slide-in-from-top-2 duration-200">
                  {item.children!.map((child) => {
                    const isChildActive = location.pathname === child.href;
                    return (
                      <Link
                        key={child.name}
                        to={child.href}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
                          isChildActive
                            ? "text-(--color-foreground) font-medium bg-(--color-muted)/50"
                            : "text-muted-foreground hover:text-(--color-foreground) hover:bg-(--color-muted)/50"
                        )}
                      >
                        {child.icon && <child.icon className="h-3.5 w-3.5" />}
                        <span>{child.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-(--color-border) p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              className={cn(
                "flex items-center gap-3 rounded-md bg-(--color-muted)/30 p-2 cursor-pointer",
                isCollapsed && "justify-center bg-transparent p-0"
              )}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--color-muted) text-xs font-medium">
                {(user?.firstName?.[0] || user?.email?.[0] || "A").toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="flex-1 overflow-hidden">
                  <div className="truncate text-sm font-medium">
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.email || "Admin User"}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {user?.email || "admin@nexus.com"}
                  </div>
                </div>
              )}
              {!isCollapsed && (
                <Settings className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-(--color-foreground)" />
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.email || "Admin User"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? (
                <Sun className="mr-2 h-4 w-4" />
              ) : (
                <Moon className="mr-2 h-4 w-4" />
              )}
              <span>Toggle Theme</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                await authProvider.logout();
                navigate("/login");
              }}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
