import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { invoices, invoiceItems } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { sql } from 'drizzle-orm';

const updateInvoiceSchema = z.object({
  invoiceNumber: z.string(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
  issueDate: z.string(),
  dueDate: z.string(),
  taxRate: z.number(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
    amount: z.number()
  }))
});

export async function PUT(
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
    const body = updateInvoiceSchema.parse(json);

    // Calculate totals
    const subtotal = body.items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = (subtotal * body.taxRate) / 100;
    const total = subtotal + taxAmount;

    // Update invoice
    const [updatedInvoice] = await db
      .update(invoices)
      .set({
        invoiceNumber: body.invoiceNumber,
        status: body.status,
        issueDate: sql`${body.issueDate}::date`,
        dueDate: sql`${body.dueDate}::date`,
        subtotal: subtotal.toString(),
        taxRate: body.taxRate.toString(),
        taxAmount: taxAmount.toString(),
        total: total.toString(),
        notes: body.notes,
        terms: body.terms,
        updatedAt: sql`CURRENT_TIMESTAMP`
      })
      .where(eq(invoices.id, id))
      .returning();

    if (!updatedInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Delete existing items
    await db
      .delete(invoiceItems)
      .where(eq(invoiceItems.invoiceId, id));

    // Create new items
    await db
      .insert(invoiceItems)
      .values(
        body.items.map(item => ({
          invoiceId: id,
          description: item.description,
          quantity: item.quantity.toString(),
          unitPrice: item.unitPrice.toString(),
          amount: item.amount.toString()
        }))
      );

    return NextResponse.json(updatedInvoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update invoice' },
      { status: 500 }
    );
  }
} 