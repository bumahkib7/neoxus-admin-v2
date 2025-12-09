import { useList, useDelete, useNavigation } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { AlertDialog, useConfirmDelete } from "@/components/ui/alert-dialog";
import { useState } from "react";
import {
  Pencil,
  Trash,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
  Package,
} from "lucide-react";

interface Product {
  id: string;
  title: string;
  handle: string;
  description?: string;
  status: string;
  images: { url: string }[];
  variants: any[];
  categories: string[];
  createdAt: string;
  updatedAt: string;
}

export const ProductList = () => {
  const { list } = useNavigation();
  const { mutate: deleteProduct } = useDelete();
  const [searchQuery, setSearchQuery] = useState("");
  const [current, setCurrent] = useState(1);
  const [pageSize] = useState(10);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  
  // Delete confirmation dialog state
  const { isOpen, pendingId, itemName, confirmDelete, handleCancel, setIsOpen } = useConfirmDelete();

  const result = useList<Product>({
    resource: "admin/products",
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

  const { isLoading, isError } = result.query;
  const products = result.result?.data || [];

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

  const handleDeleteClick = (product: Product) => {
    confirmDelete(product.id, product.title);
  };

  const handleConfirmDelete = () => {
    if (pendingId) {
      deleteProduct({
        resource: "admin/products",
        id: pendingId,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading products...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-destructive">
          Failed to load products. Ensure the backend is running.
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
              { label: "Products", href: "/products" },
            ]}
            className="mb-4"
          />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Products</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your products and variants
              </p>
            </div>
            <Button onClick={() => window.location.href = "/products/create"}>
              <span className="mr-2">+</span>
              New Product
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
                placeholder="Search products..."
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
                    Name
                    {sortField === "title" && (
                      <ArrowUpDown className="h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Collection
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <button
                    onClick={() => handleSort("variants")}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Inventory
                    {sortField === "variants" && (
                      <ArrowUpDown className="h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <button
                    onClick={() => handleSort("status")}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Status
                    {sortField === "status" && (
                      <ArrowUpDown className="h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="w-12 px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="mt-4 text-sm font-medium">
                        {searchQuery ? "No products found" : "No products yet"}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {searchQuery
                          ? "Try adjusting your search"
                          : "Get started by creating your first product"}
                      </p>
                      {!searchQuery && (
                        <Button
                          variant="outline"
                          className="mt-4"
                          size="sm"
                          onClick={() => list("admin/products/create")}
                        >
                          Create Product
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product: Product) => (
                  <tr
                    key={product.id}
                    className="group border-b border-border transition-colors hover:bg-muted/30"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-border"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded border border-border bg-muted">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0].url}
                              alt={product.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              No image
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {product.title}
                          </div>
                          {product.handle && (
                            <div className="text-xs text-muted-foreground">
                              /{product.handle}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">
                        {product.categories?.length > 0
                          ? product.categories.join(", ")
                          : "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">
                        {product.variants?.length || 0} variants
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            product.status === "PUBLISHED"
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                        />
                        <span className="text-xs capitalize">
                          {product.status.toLowerCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `/products/${product.id}/edit`;
                          }}
                          className="rounded p-1 hover:bg-muted text-muted-foreground hover:text-foreground"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(product);
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
        {products.length > 0 && (
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        variant="destructive"
        title="Delete Product"
        description={`Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancel}
      />
    </div>
  );
};
