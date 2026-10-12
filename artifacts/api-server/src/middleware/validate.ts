/**
 * SamacharHUB — Input Validation Middleware
 *
 * Provides Zod-based request validation for all API routes.
 * Attach to any route using: router.post("/path", validate(schema), handler)
 *
 * Supports validating: req.body, req.query, req.params
 */

import type { Request, Response, NextFunction } from "express";
import { z, ZodSchema, ZodError } from "zod";

type RequestPart = "body" | "query" | "params";

function formatZodError(err: ZodError): string {
  return err.errors.map((e: any) => `${e.path.join(".")}: ${e.message}`).join(", ");
}

/**
 * Validates the request body against a Zod schema.
 * Responds with 400 and a descriptive error message if validation fails.
 *
 * @example
 * const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
 * router.post("/login", validate(LoginSchema), handler);
 */
export function validate<T extends ZodSchema>(
  schema: T,
  part: RequestPart = "body"
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      res.status(400).json({
        error: "Validation failed",
        details: formatZodError(result.error),
      });
      return;
    }
    // Replace the request part with the parsed (and coerced) value
    (req as any)[part] = result.data;
    next();
  };
}

// ─────────────────────────────────────────────────────────────
// Reusable schemas for common API inputs
// ─────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const ArticleCreateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  titleMr: z.string().optional().nullable(),
  summary: z.string().min(10, "Summary must be at least 10 characters"),
  summaryMr: z.string().optional().nullable(),
  content: z.string().min(20, "Content must be at least 20 characters"),
  contentMr: z.string().optional().nullable(),
  categoryId: z.string().min(1, "Category is required"),
  author: z.string().min(1, "Author is required"),
  imageUrl: z.string().url("Invalid image URL").optional().nullable(),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  lang: z.enum(["en", "mr", "both"]).default("both"),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export const CategoryCreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  nameMr: z.string().optional().nullable(),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex code"),
  order: z.number().int().default(0),
});

export const SubscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional(),
});

export const ContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().nullable(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const EditionCreateSchema = z.object({
  cities: z.array(z.string()).min(1, "At least one city is required"),
  citiesMr: z.array(z.string()).default([]),
  date: z.string().min(1, "Date is required"),
  coverUrl: z.string().url("Invalid cover image URL"),
  pages: z.array(z.string()).default([]),
  published: z.boolean().default(true),
});
