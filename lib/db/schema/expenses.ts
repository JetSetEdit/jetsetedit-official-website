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
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Enhanced tax categories based on common business deductions
export const expenseCategoryEnum = z.enum([
  'office_supplies',
  'travel',
  'meals_entertainment',
  'equipment',
  'software_subscriptions',
  'utilities',
  'rent_lease',
  'marketing_advertising',
  'professional_services',
  'vehicle_expenses',
  'insurance',
  'training_education',
  'maintenance_repairs',
  'bank_fees',
  'office_expenses',
  'telecommunications',
  'employee_benefits',
  'other'
]);

export const expenseStatusEnum = pgEnum("expense_status", [
  "pending",
  "approved",
  "rejected",
  "reimbursed",
  "archived"
]);

// Enhanced tax deduction categories with specific rules
export const deductionCategoryEnum = z.enum([
  'home_office',           // Home office expenses
  'vehicle_business',      // Vehicle expenses for business
  'travel_domestic',       // Domestic travel
  'travel_international',  // International travel
  'meals_entertainment_50',// 50% deductible meals
  'meals_entertainment_100',// 100% deductible meals
  'education_training',    // Professional development
  'insurance_business',    // Business insurance
  'equipment_section_179', // Section 179 equipment deduction
  'depreciation',         // Regular depreciation
  'professional_services', // Legal, accounting, etc.
  'marketing',            // Advertising and marketing
  'software_saas',        // Software and SaaS subscriptions
  'research_development', // R&D expenses
  'other'
]);

// Tax jurisdictions
export const taxJurisdictionEnum = z.enum([
  'federal',
  'state',
  'local'
]);

// Enhanced expenses table
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  date: timestamp("date").defaultNow(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  status: expenseStatusEnum("status").default("pending"),
  receiptUrl: text("receipt_url"),
  notes: text("notes"),
  
  // Enhanced tax tracking
  isDeductible: boolean("is_deductible").default(false),
  deductionCategory: varchar("deduction_category", { length: 50 }),
  taxYear: integer("tax_year"),
  jurisdiction: varchar("jurisdiction", { length: 20 }),
  deductibleAmount: decimal("deductible_amount", { precision: 10, scale: 2 }),
  deductionPercentage: integer("deduction_percentage"),
  
  // Audit and compliance
  needsReceipt: boolean("needs_receipt").default(true),
  receiptVerified: boolean("receipt_verified").default(false),
  complianceNotes: text("compliance_notes"),
  auditHistory: jsonb("audit_history").$type<{
    changes: Array<{
      date: string;
      field: string;
      oldValue: any;
      newValue: any;
      user: string;
    }>;
  }>(),
  
  // Vendor information
  vendorName: varchar("vendor_name", { length: 255 }),
  vendorTaxId: varchar("vendor_tax_id", { length: 50 }),
  
  // Split transaction support
  parentExpenseId: integer("parent_expense_id").references(() => expenses.id),
  splitPercentage: decimal("split_percentage", { precision: 5, scale: 2 }),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  archivedAt: timestamp("archived_at"),
});

// Enhanced receipts table
export const receipts = pgTable("receipts", {
  id: serial("id").primaryKey(),
  expenseId: integer("expense_id").references(() => expenses.id),
  fileUrl: text("file_url").notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileSize: decimal("file_size").notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  
  // Enhanced OCR data
  ocrText: text("ocr_text"),
  ocrData: jsonb("ocr_data").$type<{
    amount?: string;
    date?: string;
    vendor?: string;
    taxInfo?: string;
    lineItems?: Array<{
      description: string;
      amount: string;
      quantity?: number;
    }>;
  }>(),
  
  // Receipt verification
  verificationStatus: varchar("verification_status", { length: 20 }).default('pending'),
  verificationNotes: text("verification_notes"),
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