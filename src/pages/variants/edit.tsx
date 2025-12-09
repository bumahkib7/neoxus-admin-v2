import { useEffect } from "react";
import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams } from "react-router";
import { Breadcrumb } from "@/components/ui/breadcrumb";

const variantSchema = z.object({
  title: z.string().min(1, "Title is required"),
  sku: z.string().optional(),
  allowBackorder: z.boolean().optional(),
  manageInventory: z.boolean().optional(),
});

export const VariantEdit = () => {
  const { id } = useParams();

  const {
    register,
    formState: { errors },
    saveButtonProps,
    refineCore,
    setValue,
  } = useForm({
    resolver: zodResolver(variantSchema) as any,
    refineCoreProps: {
      action: "edit",
      resource: "admin/variants",
      id,
    },
    defaultValues: {
      title: "",
      sku: "",
      allowBackorder: false,
      manageInventory: true,
    },
  } as any) as any;

  const queryResult = refineCore?.queryResult;

  useEffect(() => {
    const variant = queryResult?.data?.data as any;
    if (variant) {
      setValue("title", variant.title);
      setValue("sku", variant.sku || "");
      setValue("allowBackorder", !!variant.allowBackorder);
      setValue("manageInventory", !!variant.manageInventory);
    }
  }, [queryResult?.data?.data, setValue]);

  return (
    <div className="p-8">
      <Breadcrumb
        items={[
          { label: "Products", href: "/products" },
          { label: "Variants", href: "/products/variants" },
          { label: "Edit" },
        ]}
      />
      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Edit Variant</h1>
          <p className="text-sm text-muted-foreground">
            Update variant details
          </p>
        </div>
        <button
          {...saveButtonProps}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90"
        >
          Save Changes
        </button>
      </div>

      <div className="mt-6 max-w-3xl space-y-6">
        <div className="rounded-xl border border-border/50 bg-card p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/90">
              Title
            </label>
            <input
              {...register("title")}
              className="w-full h-10 rounded-lg border border-border/50 bg-background px-3 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/90">
              SKU
            </label>
            <input
              {...register("sku")}
              className="w-full h-10 rounded-lg border border-border/50 bg-background px-3 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="flex items-center gap-6 text-sm text-foreground/90">
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register("manageInventory")} />
              Manage inventory
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register("allowBackorder")} />
              Allow backorder
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
