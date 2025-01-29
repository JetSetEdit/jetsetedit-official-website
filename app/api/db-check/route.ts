import { db, clients, products, invoices } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check clients
    const allClients = await db.select().from(clients);
    console.log(`Found ${allClients.length} clients`);

    // Check products
    const allProducts = await db.select().from(products);
    console.log(`Found ${allProducts.length} products`);

    // Check invoices
    const allInvoices = await db.select().from(invoices);
    console.log(`Found ${allInvoices.length} invoices`);

    return NextResponse.json({
      clients: {
        count: allClients.length,
        sample: allClients.length > 0 ? allClients[0] : null
      },
      products: {
        count: allProducts.length,
        sample: allProducts.length > 0 ? allProducts[0] : null
      },
      invoices: {
        count: allInvoices.length,
        sample: allInvoices.length > 0 ? allInvoices[0] : null
      }
    });
  } catch (error) {
    console.error('Error checking database:', error);
    return NextResponse.json(
      { error: 'Failed to check database' },
      { status: 500 }
    );
  }
} 