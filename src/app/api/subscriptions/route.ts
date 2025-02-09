import { NextResponse } from 'next/server';
import { 
  createCustomer, 
  createHourlyProduct, 
  createHourlyPrice, 
  createHourlySubscription,
  updateSubscriptionHours,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  getUpcomingInvoice
} from '@/lib/stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const {
      email,
      name,
      hourlyRate,
      hoursPerInterval,
      productName,
      productDescription,
    } = await req.json();

    // Create a customer
    const customer = await createCustomer(email, name);

    // Create a product for the hourly service
    const product = await createHourlyProduct(
      productName || 'Hourly Service',
      productDescription
    );

    // Create a price for the hourly rate
    const price = await createHourlyPrice(product.id, hourlyRate);

    // Create a subscription
    const subscription = await createHourlySubscription(
      customer.id,
      price.id,
      hoursPerInterval || 1
    );

    return NextResponse.json({
      customerId: customer.id,
      subscriptionId: subscription.id,
      clientSecret: (subscription as any).latest_invoice.payment_intent.client_secret,
    });
  } catch (err) {
    console.error('Error creating subscription:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { subscriptionId, hoursPerInterval } = await req.json();
    
    const subscription = await updateSubscriptionHours(
      subscriptionId,
      hoursPerInterval
    );

    return NextResponse.json(subscription);
  } catch (err) {
    console.error('Error updating subscription:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { subscriptionId, action } = await req.json();
    
    let subscription;
    switch (action) {
      case 'pause':
        subscription = await pauseSubscription(subscriptionId);
        break;
      case 'resume':
        subscription = await resumeSubscription(subscriptionId);
        break;
      default:
        throw new Error('Invalid action');
    }

    return NextResponse.json(subscription);
  } catch (err) {
    console.error('Error modifying subscription:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { subscriptionId } = await req.json();
    
    const subscription = await cancelSubscription(subscriptionId);

    return NextResponse.json(subscription);
  } catch (err) {
    console.error('Error cancelling subscription:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 }
    );
  }
}

export async function GET(req: Request) {
  try {
    console.log('Starting GET request to /api/subscriptions');
    
    const session = await getServerSession(authOptions);
    console.log('Session status:', session ? 'Authenticated' : 'Not authenticated');
    console.log('Session details:', JSON.stringify(session, null, 2));
    
    if (!session) {
      console.log('No session found, returning 401');
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const customerId = url.searchParams.get('customerId');
    console.log('URL parameters:', { customerId });
    
    // If customerId is provided, get upcoming invoice
    if (customerId) {
      console.log('Fetching upcoming invoice for customer:', customerId);
      const subscriptionId = url.searchParams.get('subscriptionId');
      const newPriceId = url.searchParams.get('newPriceId');
      const newQuantity = url.searchParams.get('newQuantity');

      const upcomingInvoice = await getUpcomingInvoice(
        customerId,
        subscriptionId || undefined,
        newPriceId || undefined,
        newQuantity ? parseInt(newQuantity) : undefined
      );

      console.log('Upcoming invoice fetched successfully');
      return NextResponse.json(upcomingInvoice);
    }
    
    console.log('Fetching all subscriptions from Stripe...');
    console.log('Using Stripe key ending in:', process.env.STRIPE_SECRET_KEY?.slice(-4));
    
    // Test Stripe connection first
    let testCustomer;
    try {
      testCustomer = await stripe.customers.list({ limit: 1 });
      console.log('Stripe connection successful');
    } catch (stripeError) {
      console.error('Stripe connection test failed:', stripeError);
      return new NextResponse(
        JSON.stringify({ 
          error: 'Failed to connect to Stripe',
          details: process.env.NODE_ENV === 'development' ? stripeError.message : undefined
        }),
        { status: 500 }
      );
    }

    // First, get all subscriptions with customer data
    const subscriptions = await stripe.subscriptions.list({
      limit: 100,
      expand: ['data.customer'],
    });

    // Then, get the prices and products separately
    const transformedSubscriptions = await Promise.all(subscriptions.data.map(async subscription => {
      const customer = subscription.customer as any;
      const item = subscription.items.data[0];
      
      // Fetch price with product details
      const price = await stripe.prices.retrieve(item.price.id, {
        expand: ['product']
      });
      
      const product = price.product as any;

      return {
        id: subscription.id,
        customerId: customer.id,
        customerName: customer.name || 'Unnamed Customer',
        customerEmail: customer.email,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        plan: {
          id: product.id,
          name: product.name,
          amount: price.unit_amount ? price.unit_amount / 100 : 0,
          currency: price.currency,
          interval: price.recurring?.interval || 'month',
        }
      };
    }));

    console.log('Successfully transformed subscriptions data');
    console.log('Sending response with transformed data');

    return new NextResponse(
      JSON.stringify(transformedSubscriptions),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error in GET subscriptions:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to process request',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
      }),
      { status: 500 }
    );
  }
} 