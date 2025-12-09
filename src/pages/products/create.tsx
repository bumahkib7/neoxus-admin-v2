import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductSchema, ProductStatus, PRODUCT_STATUS_VALUES } from "@/schemas/product";
import type { CreateProductInput } from "@/schemas/product";
import { Upload, Plus, X } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useState, useRef, useEffect } from "react";
import { uploadProductImage } from "@/lib/upload";

interface ProductOption {
  title: string;
  values: string[];
}

interface ProductVariant {
  title: string;
  sku?: string;
  inventoryQuantity: number;
  manageInventory: boolean;
  allowBackorder: boolean;
  prices: { amount: number; currencyCode: string; regionId?: string | null }[];
  options: { [key: string]: string };
}

export const CreateProduct = () => {
  const [images, setImages] = useState<string[]>([]);
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    formState: { errors },
    saveButtonProps,
    setValue,
  } = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema) as any,
    defaultValues: {
      status: ProductStatus.DRAFT,
      shippingProfileId: "default",
      images: [],
      thumbnail: undefined,
      options: [],
      variants: [],
      categoryIds: [],
      salesChannelIds: [],
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    try {
      const uploads = await Promise.all(
        Array.from(files).map(async (file) => {
          try {
            return await uploadProductImage(file);
          } catch (err) {
            console.error("Upload failed", err);
            return null;
          }
        })
      );
      const successful = uploads.filter((u): u is string => !!u);
      if (successful.length > 0) {
        setImages((prev) => [...prev, ...successful]);
      }
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Keep form values in sync with image selections
  useEffect(() => {
    setValue("images", images as any);
    setValue("thumbnail", images[0] || undefined);
  }, [images, setValue]);

  const addOption = () => {
    const newOption: ProductOption = { title: "", values: [] };
    setOptions([...options, newOption]);
  };

  const updateOption = (index: number, field: keyof ProductOption, value: any) => {
    const updated = [...options];
    updated[index] = { ...updated[index], [field]: value };
    setOptions(updated);
    setValue("options", updated as any);
    generateVariants(updated);
  };

  const removeOption = (index: number) => {
    const updated = options.filter((_, i) => i !== index);
    setOptions(updated);
    setValue("options", updated as any);
    generateVariants(updated);
  };

  const addOptionValue = (optionIndex: number, value: string) => {
    if (!value.trim()) return;
    const updated = [...options];
    if (!updated[optionIndex].values.includes(value)) {
      updated[optionIndex].values.push(value);
      setOptions(updated);
      setValue("options", updated as any);
      generateVariants(updated);
    }
  };

  const removeOptionValue = (optionIndex: number, valueIndex: number) => {
    const updated = [...options];
    updated[optionIndex].values.splice(valueIndex, 1);
    setOptions(updated);
    setValue("options", updated as any);
    generateVariants(updated);
  };

  const generateVariants = (opts: ProductOption[]) => {
    if (opts.length === 0 || opts.some(opt => opt.values.length === 0)) {
      setVariants([]);
      setValue("variants", []);
      return;
    }

    const combinations = opts.reduce<string[][]>(
      (acc, opt) => {
        if (acc.length === 0) return opt.values.map(v => [v]);
        return acc.flatMap(combo => opt.values.map(v => [...combo, v]));
      },
      []
    );

    const newVariants: ProductVariant[] = combinations.map((combo) => {
      const options: { [key: string]: string } = {};
      opts.forEach((opt, i) => {
        options[opt.title] = combo[i];
      });

      return {
        title: combo.join(" / "),
        sku: "",
        inventoryQuantity: 0,
        manageInventory: true,
        allowBackorder: false,
        prices: [{ amount: 0, currencyCode: "USD", regionId: null }],
        options,
      };
    });

    setVariants(newVariants);
    setValue("variants", newVariants as any);
  };

  const addManualVariant = () => {
    const v: ProductVariant = {
      title: `Variant ${variants.length + 1}`,
      sku: "",
      inventoryQuantity: 0,
      manageInventory: true,
      allowBackorder: false,
      prices: [{ amount: 0, currencyCode: "USD", regionId: null }],
      options: {},
    };
    const updated = [...variants, v];
    setVariants(updated);
    setValue("variants", updated as any);
  };

  const updateVariantField = (index: number, field: keyof ProductVariant, value: any) => {
    const updated = [...variants];
    (updated[index] as any)[field] = value;
    setVariants(updated);
    setValue("variants", updated as any);
  };

  const updateVariantPrice = (variantIndex: number, amount: number) => {
    const updated = [...variants];
    updated[variantIndex].prices[0].amount = amount;
    setVariants(updated);
    setValue("variants", updated as any);
  };

  const updateVariantCurrency = (variantIndex: number, currency: string) => {
    const updated = [...variants];
    updated[variantIndex].prices[0].currencyCode = currency.toUpperCase();
    setVariants(updated);
    setValue("variants", updated as any);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-8 py-6">
        <Breadcrumb
          items={[
            { label: "Products", href: "/products" },
            { label: "New" },
          ]}
          className="mb-4"
        />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Create Product</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a new product to your catalog
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.location.href = "/products"}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              {...saveButtonProps}
              className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90"
            >
              Publish
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-muted/20">
        <div className="mx-auto max-w-5xl px-8 py-8">
          <form className="grid gap-8 md:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-8 md:col-span-2">
              {/* General Information */}
              <div className="rounded-xl bg-card shadow-sm">
                <div className="px-6 py-5">
                  <h2 className="text-base font-medium mb-6">General Information</h2>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label htmlFor="title" className="text-sm font-medium text-foreground/90">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="title"
                        {...register("title")}
                        className="flex h-11 w-full rounded-lg border border-border/50 bg-background px-4 py-2 text-sm transition-colors hover:border-border focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                        placeholder="Winter Jacket"
                      />
                      {errors.title && (
                        <p className="text-sm text-red-500">{errors.title.message as string}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="handle" className="text-sm font-medium text-foreground/90">
                        Handle <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="handle"
                        {...register("handle")}
                        className="flex h-11 w-full rounded-lg border border-border/50 bg-background px-4 py-2 text-sm transition-colors hover:border-border focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                        placeholder="winter-jacket"
                      />
                      <p className="text-xs text-muted-foreground">
                        Must be unique, lowercase letters, numbers, and hyphens only
                      </p>
                      {errors.handle && (
                        <p className="text-sm text-red-500">{errors.handle.message as string}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="description" className="text-sm font-medium text-foreground/90">
                        Description
                      </label>
                      <textarea
                        id="description"
                        {...register("description")}
                        className="flex min-h-[120px] w-full rounded-lg border border-border/50 bg-background px-4 py-3 text-sm transition-colors hover:border-border focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                        placeholder="Warm and comfortable winter jacket..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Media */}
              <div className="rounded-xl bg-card shadow-sm">
                <div className="px-6 py-5">
                  <h2 className="text-base font-medium mb-6">Media</h2>
                  <div className="space-y-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-48 w-full items-center justify-center rounded-xl border-2 border-dashed border-border/50 bg-muted/20 transition-colors hover:border-border hover:bg-muted/30"
                    >
                      <div className="text-center">
                        <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                        <p className="text-sm font-medium text-foreground/90">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-1.5">
                          PNG, JPG or GIF (max 5MB)
                        </p>
                      </div>
                    </button>
                    {uploading && (
                      <p className="text-xs text-muted-foreground mt-2">Uploading images...</p>
                    )}

                    {images.length > 0 && (
                      <div className="grid grid-cols-4 gap-4">
                        {images.map((image, index) => (
                          <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-border/50 bg-muted/20">
                            <img
                              src={image}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 p-1.5 rounded-full bg-background/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Variants */}
              <div className="rounded-xl bg-card shadow-sm">
                <div className="px-6 py-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-medium">Variants</h2>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={addOption}
                        className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
                      >
                        <Plus className="h-4 w-4" />
                        Add option
                      </button>
                      <button
                        type="button"
                        onClick={addManualVariant}
                        className="inline-flex items-center gap-2 rounded-md bg-foreground px-3 py-2 text-sm text-background hover:bg-foreground/90"
                      >
                        <Plus className="h-4 w-4" />
                        Add variant
                      </button>
                    </div>
                  </div>

                  {/* Options builder */}
                  <div className="space-y-4 mb-6">
                    {options.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Define options (e.g., Size, Color) to generate variants automatically, or add variants manually.
                      </p>
                    )}
                    {options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className="rounded-lg border border-border/50 bg-muted/20 p-4 space-y-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              placeholder="Option name (e.g., Size, Color)"
                              value={option.title}
                              onChange={(e) => updateOption(optionIndex, "title", e.target.value)}
                              className="flex h-10 w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm transition-colors hover:border-border focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                            <div className="flex flex-wrap gap-2">
                              {option.values.map((value, valueIndex) => (
                                <span
                                  key={valueIndex}
                                  className="inline-flex items-center gap-1.5 rounded-md bg-background border border-border/50 px-2.5 py-1 text-sm"
                                >
                                  {value}
                                  <button
                                    type="button"
                                    onClick={() => removeOptionValue(optionIndex, valueIndex)}
                                    className="hover:text-destructive"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </span>
                              ))}
                              <input
                                type="text"
                                placeholder="Add value..."
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    addOptionValue(optionIndex, e.currentTarget.value);
                                    e.currentTarget.value = "";
                                  }
                                }}
                                className="inline-flex h-7 w-32 rounded-md border border-dashed border-border/50 bg-transparent px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeOption(optionIndex)}
                            className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Variants list */}
                  {variants.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-foreground/90">
                        Variants ({variants.length})
                      </p>
                      <div className="space-y-2">
                        {variants.map((variant, variantIndex) => (
                          <div
                            key={variantIndex}
                            className="grid grid-cols-1 md:grid-cols-5 gap-3 rounded-lg border border-border/50 bg-background p-4"
                          >
                            <div className="md:col-span-2 space-y-2">
                              <input
                                type="text"
                                value={variant.title}
                                onChange={(e) => updateVariantField(variantIndex, "title", e.target.value)}
                                className="w-full h-10 rounded-lg border border-border/50 bg-background px-3 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                              />
                              <input
                                type="text"
                                placeholder="SKU"
                                value={variant.sku}
                                onChange={(e) => updateVariantField(variantIndex, "sku", e.target.value)}
                                className="w-full h-9 rounded-lg border border-border/50 bg-background px-3 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs text-muted-foreground">Price</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={variant.prices[0]?.amount ?? 0}
                                  onChange={(e) =>
                                    updateVariantPrice(variantIndex, parseFloat(e.target.value) || 0)
                                  }
                                  className="w-24 h-10 rounded-lg border border-border/50 bg-background px-3 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                                />
                                <input
                                  type="text"
                                  value={variant.prices[0]?.currencyCode ?? "USD"}
                                  onChange={(e) => updateVariantCurrency(variantIndex, e.target.value)}
                                  className="w-16 h-10 rounded-lg border border-border/50 bg-background px-2 text-sm uppercase focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs text-muted-foreground">Inventory</label>
                              <input
                                type="number"
                                value={variant.inventoryQuantity}
                                onChange={(e) =>
                                  updateVariantField(variantIndex, "inventoryQuantity", parseInt(e.target.value) || 0)
                                }
                                className="w-full h-10 rounded-lg border border-border/50 bg-background px-3 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                              />
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={variant.manageInventory}
                                    onChange={(e) => updateVariantField(variantIndex, "manageInventory", e.target.checked)}
                                  />
                                  Manage
                                </label>
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={variant.allowBackorder}
                                    onChange={(e) => updateVariantField(variantIndex, "allowBackorder", e.target.checked)}
                                  />
                                  Backorder
                                </label>
                              </div>
                            </div>
                            <div className="flex items-start justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = variants.filter((_, i) => i !== variantIndex);
                                  setVariants(updated);
                                  setValue("variants", updated as any);
                                }}
                                className="p-2 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Status */}
              <div className="rounded-xl bg-card shadow-sm">
                <div className="px-6 py-5">
                  <h2 className="text-sm font-medium text-muted-foreground mb-4">Status</h2>
                  <select
                    {...register("status")}
                    className="flex h-11 w-full rounded-lg border border-border/50 bg-background px-4 py-2 text-sm transition-colors hover:border-border focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    {PRODUCT_STATUS_VALUES.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Organization */}
              <div className="rounded-xl bg-card shadow-sm">
                <div className="px-6 py-5">
                  <h2 className="text-sm font-medium text-muted-foreground mb-5">Organization</h2>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground/90">Product Type</label>
                      <input
                        className="flex h-11 w-full rounded-lg border border-border/50 bg-background px-4 py-2 text-sm transition-colors hover:border-border focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                        placeholder="e.g., Apparel"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground/90">Collection</label>
                      <select className="flex h-11 w-full rounded-lg border border-border/50 bg-background px-4 py-2 text-sm transition-colors hover:border-border focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring">
                        <option value="">Select collection...</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground/90">Tags</label>
                      <input
                        className="flex h-11 w-full rounded-lg border border-border/50 bg-background px-4 py-2 text-sm transition-colors hover:border-border focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                        placeholder="Add tags..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground/90">
                        Shipping Profile <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("shippingProfileId")}
                        className="flex h-11 w-full rounded-lg border border-border/50 bg-background px-4 py-2 text-sm transition-colors hover:border-border focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                        placeholder="default"
                      />
                      {errors.shippingProfileId && (
                        <p className="text-sm text-red-500">
                          {errors.shippingProfileId.message as string}
                        </p>
                      )}
                    </div>
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
