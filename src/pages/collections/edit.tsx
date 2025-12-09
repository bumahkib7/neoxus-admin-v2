import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import type { HttpError } from "@refinedev/core";
import { useOne } from "@refinedev/core";

const updateCollectionSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  handle: z.string().optional(),
  // Add metadata if needed for editing
  // metadata: z.record(z.string(), z.any()).optional(),
});

type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;

interface Collection {
  collection: {
    id: string;
    title: string;
    handle: string;
    created_at: string;
    updated_at: string;
    metadata?: Record<string, any>; // Add metadata if it exists
  }
}

export const EditCollection = () => {
  const { id } = useParams<{ id: string }>();

  const collectionQuery = useOne<Collection>({
    resource: "admin/collections",
    id: id as string,
    queryOptions: {
      enabled: !!id,
    },
  });

  const {
    register,
    formState: { errors },
    saveButtonProps,
    refineCore,
    setValue,
  } = useForm<UpdateCollectionInput, HttpError, UpdateCollectionInput>({
    resolver: zodResolver(updateCollectionSchema) as any,
    refineCoreProps: {
      resource: "admin/collections",
      action: "edit",
      id,
      redirect: "list",
    },
  });

  useEffect(() => {
    if (collectionQuery.query.data?.data) {
      console.log("Data for pre-filling exists:", collectionQuery.query.data.data);
      const { collection } = collectionQuery.query.data.data;
      console.log("Collection object before setValue:", collection);
      setValue("title", collection.title);
      setValue("handle", collection.handle);
    }
  }, [collectionQuery.query.data, setValue]);
  
  if (refineCore.formLoading || collectionQuery.query.isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading collection...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-8 py-6">
        <Breadcrumb
          items={[
            { label: "Collections", href: "/collections" },
            { label: "Edit" },
          ]}
          className="mb-4"
        />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Edit Collection</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Edit product collection details
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.location.href = "/collections"}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              {...saveButtonProps}
              className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-muted/20">
        <div className="mx-auto max-w-3xl px-8 py-8">
          <form className="space-y-8">
            {/* General Information */}
            <div className="rounded-xl bg-card shadow-sm">
              <div className="px-6 py-5">
                <h2 className="text-base font-medium mb-6">Collection Details</h2>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium text-foreground/90">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="title"
                      {...register("title")}
                      className="flex h-11 w-full rounded-lg border border-border/50 bg-background px-4 py-2 text-sm transition-colors hover:border-border focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                      placeholder="Summer Collection"
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500">{errors.title.message as string}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="handle" className="text-sm font-medium text-foreground/90">
                      Handle
                    </label>
                    <input
                      id="handle"
                      {...register("handle")}
                      className="flex h-11 w-full rounded-lg border border-border/50 bg-background px-4 py-2 text-sm transition-colors hover:border-border focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                      placeholder="summer-collection"
                    />
                    <p className="text-xs text-muted-foreground">
                      Auto-generated from title if left empty. Used in URL paths.
                    </p>
                    {errors.handle && (
                      <p className="text-sm text-red-500">{errors.handle.message as string}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
