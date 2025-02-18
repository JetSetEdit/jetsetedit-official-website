import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';

export async function POST() {
  try {
    // Add stripe_customer_id column if it doesn't exist
    await db.execute(sql`
      ALTER TABLE clients 
      ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255)
    `);

    return NextResponse.json({
      message: 'Database schema updated successfully',
    });
  } catch (error) {
    console.error('Schema update failed:', error);
    return NextResponse.json(
      { 
        message: 'Schema update failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 