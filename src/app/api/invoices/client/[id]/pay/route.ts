import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const { id: invoiceId } = params;

    // Get the invoice to verify it belongs to the customer
    const invoice = await stripe.invoices.retrieve(invoiceId);
    if (invoice.customer !== session.user.stripeCustomerId) {
      return new NextResponse(
        JSON.stringify({ error: 'Invoice not found' }),
        { status: 404 }
      );
    }

    // Create a payment session for the invoice
    const paymentSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: session.user.stripeCustomerId,
      payment_intent_data: {
        setup_future_usage: 'off_session',
      },
      line_items: [
        {
          price_data: {
            currency: invoice.currency,
            product_data: {
              name: invoice.description || 'Video Editing Services',
            },
            unit_amount: invoice.amount_due,
          },
          quantity: 1,
        },
      ],
      invoice: invoiceId,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/home/invoices?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/home/invoices?canceled=true`,
    });

    return new NextResponse(
      JSON.stringify({ url: paymentSession.url }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error creating payment session:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to create payment session',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { status: 500 }
    );
  }
} 