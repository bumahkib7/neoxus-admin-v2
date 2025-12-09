import { z } from "zod";

export const ProductStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
} as const;

export type ProductStatusType = (typeof ProductStatus)[keyof typeof ProductStatus];

export const PRODUCT_STATUS_VALUES = Object.values(ProductStatus);

export const createProductSchema = z.object({
  title: z.string().min(1, "Title is required"),
  handle: z.string().min(1, "Handle is required"),
  description: z.string().optional(),
  status: z.enum([ProductStatus.DRAFT, ProductStatus.PUBLISHED]),
  shippingProfileId: z.string().optional(),
  images: z.array(z.string()).optional(),
  thumbnail: z.string().optional(),
  options: z
    .array(
      z.object({
        title: z.string().min(1, "Option title required"),
        values: z.array(z.string().min(1)).nonempty("Provide at least one value"),
      })
    )
    .optional(),
  variants: z
    .array(
      z.object({
        title: z.string().min(1, "Variant title required"),
        sku: z.string().optional(),
        inventoryQuantity: z.number().default(0),
        manageInventory: z.boolean().default(true),
        allowBackorder: z.boolean().default(false),
        options: z.record(z.string()).default({}),
        prices: z
          .array(
            z.object({
              currencyCode: z.string().min(3).max(3),
              amount: z.number(),
              regionId: z.string().optional().nullable(),
            })
          )
          .nonempty("Price required"),
      })
    )
    .optional(),
  categoryIds: z.array(z.string()).optional(),
  salesChannelIds: z.array(z.string()).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = z.object({
  title: z.string().min(1, "Title is required"),
  handle: z.string().min(1, "Handle is required"),
  description: z.string().optional(),
  status: z.enum([ProductStatus.DRAFT, ProductStatus.PUBLISHED]),
  shippingProfileId: z.string().optional(),
  images: z.array(z.string()).optional(),
  thumbnail: z.string().optional(),
  options: z
    .array(
      z.object({
        title: z.string().min(1, "Option title required"),
        values: z.array(z.string().min(1)).nonempty("Provide at least one value"),
      })
    )
    .optional(),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        title: z.string().min(1, "Variant title required"),
        sku: z.string().optional(),
        inventoryQuantity: z.number().default(0),
        manageInventory: z.boolean().default(true),
        allowBackorder: z.boolean().default(false),
        options: z.record(z.string()).default({}),
        prices: z
          .array(
            z.object({
              currencyCode: z.string().min(3).max(3),
              amount: z.number(),
              regionId: z.string().optional().nullable(),
            })
          )
          .nonempty("Price required"),
      })
    )
    .optional(),
  categoryIds: z.array(z.string()).optional(),
  salesChannelIds: z.array(z.string()).optional(),
});

export type UpdateProductInput = z.infer<typeof updateProductSchema>;
