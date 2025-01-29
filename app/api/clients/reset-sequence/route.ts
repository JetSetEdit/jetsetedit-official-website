import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function POST() {
  try {
    // Update David Morehouse's ID to 1
    await db.execute(sql`
      WITH moved_client AS (
        DELETE FROM clients
        RETURNING *
      )
      INSERT INTO clients (
        id, name, company, email, phone, type, status, notes, last_project,
        created_at, billing_address, shipping_address, tax_number, currency,
        payment_terms, credit_limit, website, industry, account_manager,
        last_invoice_date, total_revenue, outstanding_balance
      )
      SELECT 
        1, name, company, email, phone, type, status, notes, last_project,
        created_at, billing_address, shipping_address, tax_number, currency,
        payment_terms, credit_limit, website, industry, account_manager,
        last_invoice_date, total_revenue, outstanding_balance
      FROM moved_client;
    `);

    // Reset the sequence
    await db.execute(sql`
      ALTER SEQUENCE clients_id_seq RESTART WITH 2;
    `);

    return NextResponse.json({ message: 'Client ID reset successfully' });
  } catch (error) {
    console.error('Error resetting client ID:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to reset client ID' },
      { status: 500 }
    );
  }
} 