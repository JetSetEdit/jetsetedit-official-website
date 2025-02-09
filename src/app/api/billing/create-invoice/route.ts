import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const body = await request.json();
    const { subscriptionId, description } = body;

    if (!subscriptionId) {
      return new NextResponse(
        JSON.stringify({ error: 'Subscription ID is required' }),
        { status: 400 }
      );
    }

    // Get the subscription to find the customer
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Create a draft invoice
    const invoice = await stripe.invoices.create({
      customer: subscription.customer as string,
      subscription: subscriptionId,
      description: description || 'Video editing services',
      auto_advance: false, // Draft invoice
      collection_method: 'send_invoice',
      days_until_due: 30,
    });

    // Add all pending usage to the invoice
    await stripe.invoices.finalizeInvoice(invoice.id);

    return new NextResponse(
      JSON.stringify({
        success: true,
        invoiceId: invoice.id,
        invoiceUrl: invoice.hosted_invoice_url,
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error creating invoice:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to create invoice',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { status: 500 }
    );
  }
} 