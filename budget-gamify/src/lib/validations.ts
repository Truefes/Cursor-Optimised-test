import { z } from "zod"

// Budget validation schemas
export const createBudgetSchema = z.object({
  name: z.string().min(1, "Budget name is required").max(100, "Budget name must be less than 100 characters"),
  description: z.string().max(255, "Description must be less than 255 characters").optional(),
  totalAmount: z.number().min(0.01, "Budget amount must be greater than 0"),
  period: z.enum(["weekly", "monthly", "yearly"], {
    required_error: "Please select a budget period",
  }),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }),
  categories: z.array(z.object({
    name: z.string().min(1, "Category name is required"),
    icon: z.string().min(1, "Category icon is required"),
    color: z.string().min(1, "Category color is required"),
    allocated: z.number().min(0, "Allocated amount must be 0 or greater"),
  })).min(1, "At least one category is required"),
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
})

export const updateBudgetSchema = createBudgetSchema.partial().extend({
  id: z.string().cuid(),
})

// Transaction validation schemas
export const createTransactionSchema = z.object({
  amount: z.number().min(0.01, "Transaction amount must be greater than 0"),
  description: z.string().min(1, "Description is required").max(255, "Description must be less than 255 characters"),
  date: z.date({
    required_error: "Transaction date is required",
  }),
  categoryId: z.string().cuid("Invalid category ID"),
  budgetId: z.string().cuid("Invalid budget ID"),
  isRecurring: z.boolean().default(false),
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
  attachments: z.array(z.string().url()).default([]),
})

export const updateTransactionSchema = createTransactionSchema.partial().extend({
  id: z.string().cuid(),
})

// Category validation schemas
export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(50, "Category name must be less than 50 characters"),
  icon: z.string().min(1, "Category icon is required"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format"),
  allocated: z.number().min(0, "Allocated amount must be 0 or greater"),
  budgetId: z.string().cuid("Invalid budget ID"),
})

export const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.string().cuid(),
})

// User profile validation schemas
export const updateUserProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
})

// Query validation schemas
export const budgetQuerySchema = z.object({
  period: z.enum(["weekly", "monthly", "yearly"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export const transactionQuerySchema = z.object({
  budgetId: z.string().cuid().optional(),
  categoryId: z.string().cuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.string().transform(Number).pipe(z.number().min(1)).default("1"),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default("10"),
})

// Type exports
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>
export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>
export type BudgetQuery = z.infer<typeof budgetQuerySchema>
export type TransactionQuery = z.infer<typeof transactionQuerySchema>