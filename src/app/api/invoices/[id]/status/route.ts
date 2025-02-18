import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { invoices } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const updateStatusSchema = z.object({
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
});

export async function PATCH(
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

    const json = await request.json();
    const body = updateStatusSchema.parse(json);

    const [invoice] = await db
      .update(invoices)
      .set({
        status: body.status,
        updatedAt: new Date()
      })
      .where(eq(invoices.id, id))
      .returning();

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error updating invoice status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update invoice status' },
      { status: 500 }
    );
  }
} 