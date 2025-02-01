import { sql } from "drizzle-orm";
import {
  text,
  timestamp,
  pgTable,
  serial,
  varchar,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const bankConnections = pgTable("bank_connections", {
  id: serial("id").primaryKey(),
  basiqUserId: text("basiq_user_id").notNull(),
  basiqConnectionId: text("basiq_connection_id"),
  institutionId: text("institution_id").notNull(),
  institutionName: varchar("institution_name", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  lastSynced: timestamp("last_synced"),
  connectionData: jsonb("connection_data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bankTransactions = pgTable("bank_transactions", {
  id: serial("id").primaryKey(),
  basiqTransactionId: text("basiq_transaction_id").notNull(),
  connectionId: text("connection_id").references(() => bankConnections.id),
  amount: text("amount").notNull(),
  direction: varchar("direction", { length: 10 }).notNull(),
  description: text("description").notNull(),
  postDate: timestamp("post_date").notNull(),
  transactionDate: timestamp("transaction_date").notNull(),
  category: varchar("category", { length: 100 }),
  enrichment: jsonb("enrichment"),
  status: varchar("status", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schemas for validation
export const insertBankConnectionSchema = createInsertSchema(bankConnections);
export const selectBankConnectionSchema = createSelectSchema(bankConnections);

export const insertBankTransactionSchema = createInsertSchema(bankTransactions);
export const selectBankTransactionSchema = createSelectSchema(bankTransactions);

export type BankConnection = z.infer<typeof selectBankConnectionSchema>;
export type NewBankConnection = z.infer<typeof insertBankConnectionSchema>;
export type BankTransaction = z.infer<typeof selectBankTransactionSchema>;
export type NewBankTransaction = z.infer<typeof insertBankTransactionSchema>; 