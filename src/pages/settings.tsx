import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun, Monitor, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";

const API_URL = import.meta.env.VITE_API_URL;

export const Settings = () => {
  const { theme, setTheme } = useTheme();

  const reindexMutation = useMutation({
    mutationFn: async () => {
      const token = Cookies.get("auth_token");
      const resp = await axios.post(
        `${API_URL}/api/affiliate/admin/search/reindex`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return resp.data;
    },
  });

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium">Appearance</h2>
        <div className="grid grid-cols-3 gap-4 max-w-md">
          <button
            onClick={() => setTheme("light")}
            className={cn(
              "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground",
              theme === "light" && "border-primary"
            )}
          >
            <Sun className="mb-3 h-6 w-6" />
            <span className="text-xs font-medium">Light</span>
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={cn(
              "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground",
              theme === "dark" && "border-primary"
            )}
          >
            <Moon className="mb-3 h-6 w-6" />
            <span className="text-xs font-medium">Dark</span>
          </button>
          <button
            onClick={() => setTheme("system")}
            className={cn(
              "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground",
              theme === "system" && "border-primary"
            )}
          >
            <Monitor className="mb-3 h-6 w-6" />
            <span className="text-xs font-medium">System</span>
          </button>
        </div>
        <p className="text-[0.8rem] text-muted-foreground">
          Customize the look and feel of the dashboard. Automatically switch between day and night themes.
        </p>
      </div>

      <div className="space-y-3 rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium">Search indexing</h2>
            <p className="text-sm text-muted-foreground">
              Rebuild the Elasticsearch index for products, brands, categories, and merchants.
            </p>
          </div>
          <button
            onClick={() => reindexMutation.mutate()}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={reindexMutation.isPending}
          >
            <Search className="h-4 w-4" />
            {reindexMutation.isPending ? "Reindexing..." : "Reindex search"}
          </button>
        </div>
        {reindexMutation.data ? (
          <p className="text-xs text-muted-foreground">
            Indexed {reindexMutation.data.indexed ?? 0} documents. Search enabled: {String(reindexMutation.data.searchEnabled ?? false)}.
          </p>
        ) : null}
        {reindexMutation.isError ? (
          <p className="text-xs text-red-500">
            Failed to reindex: {(reindexMutation.error as Error)?.message ?? "Unknown error"}
          </p>
        ) : null}
      </div>
    </div>
  );
};
