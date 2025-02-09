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
    const { priceId, email, name } = body;

    if (!priceId) {
      return new NextResponse(
        JSON.stringify({ error: 'Price ID is required' }),
        { status: 400 }
      );
    }

    console.log('Creating subscription...', { priceId, email, name });

    // Create or retrieve customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      console.log('Found existing customer:', customer.id);
    } else {
      customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          source: 'JetSetEdit Website',
        },
      });
      console.log('Created new customer:', customer.id);
    }

    // Create a subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    console.log('Created subscription:', subscription.id);

    const invoice = subscription.latest_invoice as any;
    const payment_intent = invoice.payment_intent;

    return new NextResponse(
      JSON.stringify({
        subscriptionId: subscription.id,
        clientSecret: payment_intent.client_secret,
        customerId: customer.id,
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error creating subscription:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to create subscription',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { status: 500 }
    );
  }
} 