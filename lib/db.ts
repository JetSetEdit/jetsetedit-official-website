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
import { count, eq, ilike } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';

export const db = drizzle(neon(process.env.POSTGRES_URL!));

export const statusEnum = pgEnum('status', ['active', 'inactive', 'archived']);
export const clientTypeEnum = pgEnum('client_type', ['individual', 'business', 'agency']);

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
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export type SelectClient = typeof clients.$inferSelect;
export const insertClientSchema = createInsertSchema(clients);

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
  offset: number
): Promise<{
  clients: SelectClient[];
  newOffset: number | null;
  totalClients: number;
}> {
  if (search) {
    return {
      clients: await db
        .select()
        .from(clients)
        .where(ilike(clients.name, `%${search}%`))
        .limit(1000),
      newOffset: null,
      totalClients: 0
    };
  }

  if (offset === null) {
    return { clients: [], newOffset: null, totalClients: 0 };
  }

  let totalClients = await db.select({ count: count() }).from(clients);
  let moreClients = await db.select().from(clients).limit(5).offset(offset);
  let newOffset = moreClients.length >= 5 ? offset + 5 : null;

  return {
    clients: moreClients,
    newOffset,
    totalClients: totalClients[0].count
  };
}

export async function deleteClientById(id: number) {
  await db.delete(clients).where(eq(clients.id, id));
}
