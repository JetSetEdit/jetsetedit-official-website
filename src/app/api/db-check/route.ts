import { db, clients, products, invoices } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [clientCount, productCount, invoiceCount] = await Promise.all([
      db.select().from(clients),
      db.select().from(products),
      db.select().from(invoices),
    ]);

    return NextResponse.json({
      status: 'connected',
      tables: {
        clients: clientCount.length,
        products: productCount.length,
        invoices: invoiceCount.length,
      }
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to connect to database'
      },
      { status: 500 }
    );
  }
} 