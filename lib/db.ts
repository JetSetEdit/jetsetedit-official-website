import 'server-only';

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import {
  pgTable,
  text,
  numeric,
  integer,
  timestamp,
  pgEnum,
  serial,
  date,
  varchar
} from 'drizzle-orm/pg-core';
import { count, eq, ilike, and, or } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { sql } from 'drizzle-orm';

export const db = drizzle(neon(process.env.POSTGRES_URL!));

export const statusEnum = pgEnum('status', ['active', 'inactive', 'archived']);
export const clientTypeEnum = pgEnum('client_type', ['individual', 'business', 'agency']);
export const invoiceStatusEnum = pgEnum('invoice_status', ['draft', 'sent', 'paid', 'overdue', 'cancelled']);

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  imageUrl: text('image_url').notNull(),
  name: text('name').notNull(),
  status: statusEnum('status').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  stock: integer('stock').notNull(),
  availableAt: timestamp('available_at').notNull()
});

export type SelectProduct = typeof products.$inferSelect;
export const insertProductSchema = createInsertSchema(products);

export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  company: varchar('company', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  type: clientTypeEnum('type').notNull().default('individual'),
  status: statusEnum('status').notNull().default('active'),
  notes: text('notes'),
  lastProject: date('last_project'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  billingAddress: text('billing_address'),
  shippingAddress: text('shipping_address'),
  taxNumber: varchar('tax_number', { length: 50 }),
  currency: varchar('currency', { length: 3 }).default('USD'),
  paymentTerms: integer('payment_terms').default(30),
  creditLimit: numeric('credit_limit', { precision: 10, scale: 2 }),
  website: varchar('website', { length: 255 }),
  industry: varchar('industry', { length: 100 }),
  accountManager: varchar('account_manager', { length: 255 }),
  lastInvoiceDate: date('last_invoice_date'),
  totalRevenue: numeric('total_revenue', { precision: 15, scale: 2 }).default('0'),
  outstandingBalance: numeric('outstanding_balance', { precision: 15, scale: 2 }).default('0')
});

export type SelectClient = typeof clients.$inferSelect;
export const insertClientSchema = createInsertSchema(clients);

export const invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').references(() => clients.id, { onDelete: 'cascade' }).notNull(),
  invoiceNumber: varchar('invoice_number', { length: 50 }).notNull(),
  status: invoiceStatusEnum('status').notNull().default('draft'),
  issueDate: date('issue_date').notNull(),
  dueDate: date('due_date').notNull(),
  subtotal: numeric('subtotal', { precision: 15, scale: 2 }).notNull(),
  taxRate: numeric('tax_rate', { precision: 5, scale: 2 }).default('0'),
  taxAmount: numeric('tax_amount', { precision: 15, scale: 2 }).notNull(),
  total: numeric('total', { precision: 15, scale: 2 }).notNull(),
  notes: text('notes'),
  terms: text('terms'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const invoiceItems = pgTable('invoice_items', {
  id: serial('id').primaryKey(),
  invoiceId: integer('invoice_id').references(() => invoices.id, { onDelete: 'cascade' }).notNull(),
  description: text('description').notNull(),
  quantity: numeric('quantity', { precision: 10, scale: 2 }).notNull(),
  unitPrice: numeric('unit_price', { precision: 15, scale: 2 }).notNull(),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull()
});

export const invoicePayments = pgTable('invoice_payments', {
  id: serial('id').primaryKey(),
  invoiceId: integer('invoice_id').references(() => invoices.id, { onDelete: 'cascade' }).notNull(),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  paymentDate: date('payment_date').notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }).notNull(),
  reference: varchar('reference', { length: 100 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export type SelectInvoice = typeof invoices.$inferSelect;
export type SelectInvoiceItem = typeof invoiceItems.$inferSelect;
export type SelectInvoicePayment = typeof invoicePayments.$inferSelect;

export const insertInvoiceSchema = createInsertSchema(invoices);
export const insertInvoiceItemSchema = createInsertSchema(invoiceItems);
export const insertInvoicePaymentSchema = createInsertSchema(invoicePayments);

export async function getProducts(
  search: string,
  offset: number
): Promise<{
  products: SelectProduct[];
  newOffset: number | null;
  totalProducts: number;
}> {
  // Always search the full table, not per page
  if (search) {
    return {
      products: await db
        .select()
        .from(products)
        .where(ilike(products.name, `%${search}%`))
        .limit(1000),
      newOffset: null,
      totalProducts: 0
    };
  }

  if (offset === null) {
    return { products: [], newOffset: null, totalProducts: 0 };
  }

  let totalProducts = await db.select({ count: count() }).from(products);
  let moreProducts = await db.select().from(products).limit(5).offset(offset);
  let newOffset = moreProducts.length >= 5 ? offset + 5 : null;

  return {
    products: moreProducts,
    newOffset,
    totalProducts: totalProducts[0].count
  };
}

export async function deleteProductById(id: number) {
  await db.delete(products).where(eq(products.id, id));
}

export async function getClients(
  search: string,
  offset: number,
  filter?: { type?: 'individual' | 'business' | 'agency'; status?: 'active' }
) {
  const limit = 10;
  const query = db
    .select()
    .from(clients)
    .where(
      and(
        filter?.type ? eq(clients.type, filter.type) : undefined,
        filter?.status ? eq(clients.status, filter.status) : undefined,
        search
          ? or(
              ilike(clients.name, `%${search}%`),
              ilike(clients.email, `%${search}%`)
            )
          : undefined
      )
    )
    .limit(limit)
    .offset(offset);

  const totalQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(clients)
    .where(
      and(
        filter?.type ? eq(clients.type, filter.type) : undefined,
        filter?.status ? eq(clients.status, filter.status) : undefined,
        search
          ? or(
              ilike(clients.name, `%${search}%`),
              ilike(clients.email, `%${search}%`)
            )
          : undefined
      )
    );

  const [result, [{ count }]] = await Promise.all([query, totalQuery]);

  return {
    clients: result,
    newOffset: offset,
    totalClients: count,
  };
}

export async function deleteClientById(id: number) {
  await db.delete(clients).where(eq(clients.id, id));
}

export async function getClientById(id: number): Promise<{
  client: SelectClient;
  recentInvoices: SelectInvoice[];
  stats: {
    totalInvoices: number;
    totalPaid: number;
    totalOutstanding: number;
    averageInvoiceAmount: number;
  };
} | null> {
  const client = await db
    .select()
    .from(clients)
    .where(eq(clients.id, id))
    .limit(1);

  if (!client[0]) {
    return null;
  }

  const recentInvoices = await db
    .select()
    .from(invoices)
    .where(eq(invoices.clientId, id))
    .orderBy(sql`${invoices.createdAt} DESC`)
    .limit(5);

  const stats = await db
    .select({
      totalInvoices: sql<number>`COUNT(*)`,
      totalPaid: sql<number>`SUM(CASE WHEN status = 'paid' THEN total ELSE 0 END)`,
      totalOutstanding: sql<number>`SUM(CASE WHEN status != 'paid' AND status != 'cancelled' THEN total ELSE 0 END)`,
      averageInvoiceAmount: sql<number>`AVG(total)`
    })
    .from(invoices)
    .where(eq(invoices.clientId, id));

  return {
    client: client[0],
    recentInvoices,
    stats: {
      totalInvoices: stats[0].totalInvoices ?? 0,
      totalPaid: Number(stats[0].totalPaid) ?? 0,
      totalOutstanding: Number(stats[0].totalOutstanding) ?? 0,
      averageInvoiceAmount: Number(stats[0].averageInvoiceAmount) ?? 0
    }
  };
}

export async function getInvoices(
  clientId?: number,
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled',
  offset = 0
): Promise<{
  invoices: SelectInvoice[];
  newOffset: number | null;
  totalInvoices: number;
}> {
  let query = db.select().from(invoices);

  if (clientId) {
    query = query.where(eq(invoices.clientId, clientId));
  }

  if (status) {
    query = query.where(eq(invoices.status, status));
  }

  const totalInvoices = await db
    .select({ count: count() })
    .from(invoices)
    .where(
      clientId ? eq(invoices.clientId, clientId) : undefined,
      status ? eq(invoices.status, status) : undefined
    );

  const moreInvoices = await query
    .orderBy(invoices.createdAt)
    .limit(10)
    .offset(offset);

  const newOffset = moreInvoices.length >= 10 ? offset + 10 : null;

  return {
    invoices: moreInvoices,
    newOffset,
    totalInvoices: totalInvoices[0].count
  };
}

export async function getInvoiceWithItems(id: number): Promise<{
  invoice: SelectInvoice;
  items: SelectInvoiceItem[];
  payments: SelectInvoicePayment[];
} | null> {
  const invoice = await db
    .select()
    .from(invoices)
    .where(eq(invoices.id, id))
    .limit(1);

  if (!invoice[0]) {
    return null;
  }

  const items = await db
    .select()
    .from(invoiceItems)
    .where(eq(invoiceItems.invoiceId, id));

  const payments = await db
    .select()
    .from(invoicePayments)
    .where(eq(invoicePayments.invoiceId, id));

  return {
    invoice: invoice[0],
    items,
    payments
  };
}
