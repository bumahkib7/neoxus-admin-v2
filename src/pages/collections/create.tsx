import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Breadcrumb } from "@/components/ui/breadcrumb";

const createCollectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  handle: z.string().optional(),
});

type CreateCollectionInput = z.infer<typeof createCollectionSchema>;

export const CreateCollection = () => {
  const {
    register,
    formState: { errors },
    saveButtonProps,
  } = useForm<CreateCollectionInput>({
    resolver: zodResolver(createCollectionSchema) as any,
    refineCoreProps: {
      resource: "admin/collections",
      action: "create",
      redirect: "list",
    },
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-8 py-6">
        <Breadcrumb
          items={[
            { label: "Collections", href: "/collections" },
            { label: "New" },
          ]}
          className="mb-4"
        />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Create Collection</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a new product collection
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
              Create
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
