import { useList, useDelete } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useState } from "react";
import {
  Pencil,
  Trash,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
  FolderOpen,
} from "lucide-react";

interface Collection {
  id: string;
  title: string;
  handle: string;
  created_at: string;
  updated_at: string;
}

export const CollectionList = () => {
  const { mutate: deleteCollection } = useDelete();
  const [searchQuery, setSearchQuery] = useState("");
  const [current, setCurrent] = useState(1);
  const [pageSize] = useState(10);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const result = useList<Collection>({
    resource: "admin/collections",
    pagination: {
      current,
      pageSize,
    },
    filters: searchQuery
      ? [
          {
            field: "q",
            operator: "contains",
            value: searchQuery,
          },
        ]
      : [],
    sorters: sortField
      ? [
          {
            field: sortField,
            order: sortOrder,
          },
        ]
      : undefined,
  } as any);

  const { data, isLoading, isError } = result.query;
  const collections = data?.data || [];

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrent(1);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this collection?")) {
      deleteCollection({
        resource: "admin/collections",
        id,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading collections...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-destructive">
          Failed to load collections. Ensure the backend is running.
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="px-8 py-6">
          <Breadcrumb
            items={[
              { label: "Collections", href: "/collections" },
            ]}
            className="mb-4"
          />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Collections</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your product collections
              </p>
            </div>
            <Button onClick={() => window.location.href = "/collections/create"}>
              <span className="mr-2">+</span>
              New Collection
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="border-b border-border bg-card px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="relative max-w-sm">
              <input
                type="text"
                placeholder="Search collections..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          <button
            onClick={() => alert('Filters functionality coming soon')}
            className="flex items-center gap-2 rounded-md border border-border bg-transparent px-3 py-2 text-xs font-medium hover:bg-muted"
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
          </button>
          <button
            onClick={() => {
              const newOrder = sortOrder === "asc" ? "desc" : "asc";
              setSortOrder(newOrder);
              setSortField("title");
            }}
            className="flex items-center gap-2 rounded-md border border-border bg-transparent px-3 py-2 text-xs font-medium hover:bg-muted"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            Sort {sortField && `(${sortOrder})`}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="rounded-lg border border-border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="w-12 px-6 py-3">
                  <input
                    type="checkbox"
                    className="rounded border-border"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <button
                    onClick={() => handleSort("title")}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Title
                    {sortField === "title" && (
                      <ArrowUpDown className="h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Handle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <button
                    onClick={() => handleSort("created_at")}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Created
                    {sortField === "created_at" && (
                      <ArrowUpDown className="h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="w-12 px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {collections.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <FolderOpen className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="mt-4 text-sm font-medium">
                        {searchQuery ? "No collections found" : "No collections yet"}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {searchQuery
                          ? "Try adjusting your search"
                          : "Get started by creating your first collection"}
                      </p>
                      {!searchQuery && (
                        <Button
                          variant="outline"
                          className="mt-4"
                          size="sm"
                          onClick={() => window.location.href = "/collections/create"}
                        >
                          Create Collection
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                collections.map((collection: Collection) => (
                  <tr
                    key={collection.id}
                    className="group border-b border-border transition-colors hover:bg-muted/30"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-border"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">
                        {collection.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">
                        /{collection.handle}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">
                        {new Date(collection.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `/collections/${collection.id}/edit`;
                          }}
                          className="rounded p-1 hover:bg-muted text-muted-foreground hover:text-foreground"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(collection.id);
                          }}
                          className="rounded p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                          title="Delete"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {collections.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Page {current} of {Math.ceil((result.result?.total || 0) / pageSize)}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrent(current - 1)}
                disabled={current === 1}
                className="flex items-center gap-1 rounded-md border border-border bg-transparent px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
              >
                <ChevronLeft className="h-3 w-3" />
                Previous
              </button>
              <button
                onClick={() => setCurrent(current + 1)}
                disabled={current === Math.ceil((result.result?.total || 0) / pageSize)}
                className="flex items-center gap-1 rounded-md border border-border bg-transparent px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
