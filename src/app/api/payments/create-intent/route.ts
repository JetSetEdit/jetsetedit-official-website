import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db, invoices } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { invoiceId, amount } = await request.json();

    // Get invoice details
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, invoiceId))
      .limit(1);

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    if (invoice.status === 'paid') {
      return NextResponse.json(
        { error: 'Invoice has already been paid' },
        { status: 400 }
      );
    }

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'aud', // Using AUD as default currency
      metadata: {
        invoiceId: String(invoiceId),
        invoiceNumber: invoice.invoiceNumber,
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
} 