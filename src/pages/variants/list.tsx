import { useList } from "@refinedev/core";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useNavigate } from "react-router";
import { useState } from "react";

type Variant = {
  id: string;
  productId: string;
  title: string;
  sku?: string;
  prices?: { amount: number; currencyCode: string }[];
  allowBackorder?: boolean;
  manageInventory?: boolean;
  updatedAt?: string;
  options?: Record<string, string>;
  productTitle?: string;
  createdAt?: string;
};

export const VariantList = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { query, result } = useList<Variant>({
    resource: "admin/variants",
    pagination: {
      currentPage,
      pageSize,
      mode: "server",
    },
  });

  const { isLoading } = query;

  // Backend responds with {content, page:{totalElements}}. Fall back to array or data.total
  const raw = (result as any) ?? {};
  const variants: Variant[] = Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.content)
    ? raw.content
    : [];
  const total = raw?.total ?? raw?.page?.totalElements ?? variants.length;

  const formatPrice = (prices?: Variant["prices"]) => {
    if (!prices || prices.length === 0) return "—";
    return prices
      .map((p) => `${p.amount} ${p.currencyCode.toUpperCase()}`)
      .join(", ");
  };

  const formatOptions = (opts?: Record<string, string>) => {
    if (!opts || Object.keys(opts).length === 0) return "—";
    return Object.entries(opts)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
  };

  return (
    <div className="p-8">
      <Breadcrumb items={[{ label: "Products", href: "/products" }, { label: "Variants" }]} />
      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Variants</h1>
          <p className="text-sm text-muted-foreground">
            Manage all product variants in one place.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <div className="p-4 text-sm text-muted-foreground">Loading variants...</div>
        ) : variants.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">No variants found.</div>
        ) : (
          variants.map((variant: any) => {
            return (
              <div
                key={variant.id}
                className="rounded-xl border border-border/50 bg-card/70 px-4 py-3 shadow-sm hover:shadow transition"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-col gap-1 min-w-[200px]">
                    <span className="text-sm font-semibold text-foreground/90">{variant.title}</span>
                    <span className="text-xs text-muted-foreground">SKU: {variant.sku || "—"}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-muted px-3 py-1">
                      {formatOptions(variant.options)}
                    </span>
                    <span className="rounded-full bg-muted px-3 py-1">
                      {formatPrice(variant.prices)}
                    </span>
                    <span className="rounded-full bg-muted px-3 py-1">
                      {variant.manageInventory ? "Managed" : "Unmanaged"}
                      {variant.allowBackorder ? " · Backorder" : ""}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {variant.updatedAt
                      ? new Date(variant.updatedAt).toLocaleDateString()
                      : "—"}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate(`/products/variants/${variant.id}/edit`)}
                      className="text-sm text-foreground hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {(currentPage - 1) * pageSize + 1}-
          {Math.min(currentPage * pageSize, total)} of {total}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded border border-border px-3 py-1 disabled:opacity-50"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((currentPage ?? 1) - 1)}
          >
            Prev
          </button>
          <button
            className="rounded border border-border px-3 py-1 disabled:opacity-50"
            disabled={currentPage * pageSize >= total}
            onClick={() => setCurrentPage((currentPage ?? 1) + 1)}
          >
            Next
          </button>
          <select
            className="rounded border border-border px-2 py-1"
            value={pageSize}
            onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
          >
            {[10, 25, 50].map((s) => (
              <option key={s} value={s}>
                {s} / page
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
