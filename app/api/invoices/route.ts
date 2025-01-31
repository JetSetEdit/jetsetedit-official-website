import { db, clients, invoices, invoiceItems } from '@/lib/db';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import Stripe from 'stripe';
import { sql } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
});

const createInvoiceSchema = z.object({
  clientId: z.number(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
  })),
  notes: z.string().optional(),
  terms: z.string().optional(),
  dueDate: z.string(), // ISO date string
});

export async function POST(request: Request) {
  try {
    console.log('Received invoice creation request');
    const json = await request.json();
    console.log('Request body:', json);
    
    const body = createInvoiceSchema.parse(json);
    console.log('Validated request data:', body);

    // Get client's Stripe customer ID
    const client = await db
      .select()
      .from(clients)
      .where(sql`id = ${body.clientId}`)
      .limit(1);

    console.log('Found client:', client[0]);

    if (!client[0] || !client[0].stripeCustomerId) {
      console.error('Client not found or missing Stripe ID:', { clientId: body.clientId, client: client[0] });
      return NextResponse.json(
        { message: 'Client not found or no Stripe customer ID' },
        { status: 404 }
      );
    }

    // Calculate totals
    const subtotal = body.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const taxRate = 0.1; // 10% tax rate
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    console.log('Calculated totals:', { subtotal, taxRate, taxAmount, total });

    try {
      // Create Stripe invoice
      console.log('Creating Stripe invoice for customer:', client[0].stripeCustomerId);
      const stripeInvoice = await stripe.invoices.create({
        customer: client[0].stripeCustomerId,
        collection_method: 'send_invoice',
        days_until_due: 30,
        currency: 'aud', // Set currency to AUD since the client is in Australia
      });

      console.log('Created Stripe invoice:', stripeInvoice.id);

      // Add invoice items to Stripe
      for (const item of body.items) {
        console.log('Adding invoice item to Stripe:', item);
        await stripe.invoiceItems.create({
          customer: client[0].stripeCustomerId,
          invoice: stripeInvoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_amount: Math.round(item.unitPrice * 100), // Convert to cents
          currency: 'aud', // Match the invoice currency
        });
      }

      // Finalize the invoice
      console.log('Finalizing Stripe invoice');
      await stripe.invoices.finalizeInvoice(stripeInvoice.id);

      // Create invoice in our database
      const invoiceNumber = `INV-${Date.now()}`;
      console.log('Creating invoice in database:', invoiceNumber);
      const result = await db.insert(invoices).values({
        clientId: body.clientId,
        invoiceNumber,
        status: 'draft',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: body.dueDate,
        subtotal: subtotal.toString(),
        taxRate: taxRate.toString(),
        taxAmount: taxAmount.toString(),
        total: total.toString(),
        notes: body.notes || null,
        terms: body.terms || null,
      }).returning();

      const newInvoice = result[0];
      console.log('Created invoice in database:', newInvoice);

      // Create invoice items in our database
      console.log('Creating invoice items in database');
      await Promise.all(
        body.items.map((item) =>
          db.insert(invoiceItems).values({
            invoiceId: newInvoice.id,
            description: item.description,
            quantity: item.quantity.toString(),
            unitPrice: item.unitPrice.toString(),
            amount: (item.quantity * item.unitPrice).toString(),
          })
        )
      );

      return NextResponse.json({
        message: 'Invoice created successfully',
        invoiceId: newInvoice.id,
        stripeInvoiceId: stripeInvoice.id,
      });
    } catch (stripeError) {
      console.error('Stripe error:', stripeError);
      throw stripeError;
    }
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { 
        message: 'Failed to create invoice', 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 