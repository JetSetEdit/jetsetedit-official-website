import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { invoices, invoiceItems } from '@/lib/db';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import type { InferInsertModel } from 'drizzle-orm';

type NewInvoice = InferInsertModel<typeof invoices>;
type NewInvoiceItem = InferInsertModel<typeof invoiceItems>;

const createInvoiceSchema = z.object({
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

export async function POST(
  request: Request,
  { params }: { params: { clientId: string } }
) {
  try {
    if (!params.clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    const clientId = parseInt(params.clientId);
    if (isNaN(clientId)) {
      return NextResponse.json(
        { error: 'Invalid client ID' },
        { status: 400 }
      );
    }

    const json = await request.json();
    const body = createInvoiceSchema.parse(json);

    // Calculate totals
    const subtotal = body.items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = (subtotal * body.taxRate) / 100;
    const total = subtotal + taxAmount;

    // Create invoice with proper types
    const newInvoice: NewInvoice = {
      clientId,
      invoiceNumber: body.invoiceNumber,
      status: body.status,
      issueDate: body.issueDate,
      dueDate: body.dueDate,
      subtotal: subtotal.toString(),
      taxRate: body.taxRate.toString(),
      taxAmount: taxAmount.toString(),
      total: total.toString(),
      notes: body.notes,
      terms: body.terms
    };

    const [invoice] = await db.insert(invoices).values(newInvoice).returning();

    if (!invoice?.id) {
      throw new Error('Failed to create invoice');
    }

    // Create invoice items with proper types
    const newItems: NewInvoiceItem[] = body.items.map(item => ({
      invoiceId: invoice.id,
      description: item.description,
      quantity: item.quantity.toString(),
      unitPrice: item.unitPrice.toString(),
      amount: item.amount.toString()
    }));

    await db.insert(invoiceItems).values(newItems);

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create invoice' },
      { status: 500 }
    );
  }
} 