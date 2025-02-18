import { NextResponse } from 'next/server';
import { db, invoices } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid invoice ID' },
        { status: 400 }
      );
    }

    // Update invoice status to paid
    await db
      .update(invoices)
      .set({ status: 'paid' })
      .where(eq(invoices.id, id));

    return NextResponse.json({ message: 'Invoice marked as paid' });
  } catch (error) {
    console.error('Error marking invoice as paid:', error);
    return NextResponse.json(
      { error: 'Failed to mark invoice as paid' },
      { status: 500 }
    );
  }
} 