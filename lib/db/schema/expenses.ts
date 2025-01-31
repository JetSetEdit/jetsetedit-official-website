import { sql } from "drizzle-orm";
import {
  boolean,
  decimal,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const expenseCategoryEnum = z.enum([
  'office_supplies',
  'travel',
  'meals',
  'equipment',
  'software',
  'utilities',
  'rent',
  'marketing',
  'professional_services',
  'other'
]);

export const expenseStatusEnum = pgEnum("expense_status", [
  "pending",
  "approved",
  "rejected",
  "reimbursed",
]);

export const deductionCategoryEnum = z.enum([
  'business_use',
  'vehicle',
  'travel',
  'education',
  'insurance',
  'other'
]);

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  date: timestamp("date").defaultNow(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  status: expenseStatusEnum("status").default("pending"),
  receiptUrl: text("receipt_url"),
  notes: text("notes"),
  isDeductible: boolean("is_deductible").default(false),
  deductionCategory: varchar("deduction_category", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const receipts = pgTable("receipts", {
  id: serial("id").primaryKey(),
  expenseId: integer("expense_id").references(() => expenses.id),
  fileUrl: text("file_url").notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileSize: decimal("file_size").notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  ocrText: text("ocr_text"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schemas for validation
export const insertExpenseSchema = createInsertSchema(expenses);
export const selectExpenseSchema = createSelectSchema(expenses);

export const insertReceiptSchema = createInsertSchema(receipts);
export const selectReceiptSchema = createSelectSchema(receipts);

export type Expense = z.infer<typeof selectExpenseSchema>;
export type NewExpense = z.infer<typeof insertExpenseSchema>;
export type Receipt = z.infer<typeof selectReceiptSchema>;
export type NewReceipt = z.infer<typeof insertReceiptSchema>; 