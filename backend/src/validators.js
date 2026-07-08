import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  brand: z.string().min(1, "Brand is required"),
  price: z.number().nonnegative("Price must be non-negative"),
  discountPrice: z.number().nullable().optional(),
  description: z.string().min(1, "Description is required"),
  images: z.array(z.string().url()).min(1, "At least one image is required"),
  sizes: z.array(z.string()),
  colors: z.array(z.string()),
  sku: z.string().min(3, "SKU is required"),
  tags: z.array(z.string()),
  collections: z.array(z.string()).optional().default([]),
  stockStatus: z.string(),
  stockQuantity: z.number().int().nonnegative().default(0),
  featured: z.boolean().optional(),
  newArrival: z.boolean().optional(),
  bestseller: z.boolean().optional(),
});

export const collectionSchema = z.object({
  title: z.string().min(1),
  tag: z.string().min(1),
  image: z.string().min(1),
  href: z.string().min(1),
  type: z.string().optional().default('category'),
});

export const statSchema = z.object({
  value: z.number().int(),
  suffix: z.string(),
  label: z.string().min(1),
});

export const orderSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional().nullable(),
  shippingAddress: z.string().min(10),
  totalAmount: z.number().positive(),
  items: z.array(z.object({
    productId: z.string(),
    name: z.string(),
    quantity: z.number().int().positive(),
    price: z.number(),
    size: z.string().optional(),
    color: z.string().optional(),
  })).min(1),
});

export const messageSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().optional().nullable(),
  message: z.string().min(5),
});

export const subscriberSchema = z.object({
  email: z.string().email(),
});

export const lookbookSchema = z.object({
  image: z.string().url(),
  title: z.string().min(1),
  size: z.enum(["lg", "wide", "tall", "base"]).default("base"),
  order: z.number().optional(),
});

export const communityImageSchema = z.object({
  image: z.string().url(),
  alt: z.string().optional().nullable(),
  order: z.number().optional(),
});

export const testimonialSchema = z.object({
  name: z.string().min(1),
  text: z.string().min(1),
  order: z.number().optional(),
});

export const reviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().nullable(),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z.string().min(5, "Review must be at least 5 characters"),
});

export const siteSettingsSchema = z.object({
  heroBgType: z.enum(["color", "image"]).default("image"),
  heroBgColor: z.string(),
  heroBgImage: z.string().optional().nullable(),
  
  collectionsBgType: z.enum(["color", "image"]).default("color"),
  collectionsBgColor: z.string(),
  collectionsBgImage: z.string().optional().nullable(),
  
  featuredBgType: z.enum(["color", "image"]).default("color"),
  featuredBgColor: z.string(),
  featuredBgImage: z.string().optional().nullable(),
  
  brandStoryBgType: z.enum(["color", "image"]).default("color"),
  brandStoryBgColor: z.string(),
  brandStoryBgImage: z.string().optional().nullable(),
  
  lookbookBgType: z.enum(["color", "image"]).default("color"),
  lookbookBgColor: z.string(),
  lookbookBgImage: z.string().optional().nullable(),
  
  impactNumbersBgType: z.enum(["color", "image"]).default("color"),
  impactNumbersBgColor: z.string(),
  impactNumbersBgImage: z.string().optional().nullable(),
  
  communityBgType: z.enum(["color", "image"]).default("color"),
  communityBgColor: z.string(),
  communityBgImage: z.string().optional().nullable(),
  
  newsletterBgType: z.enum(["color", "image"]).default("color"),
  newsletterBgColor: z.string(),
  newsletterBgImage: z.string().optional().nullable(),
});

