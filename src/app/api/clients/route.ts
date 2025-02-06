import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { stripe } from '@/lib/stripe';

export async function GET() {
  try {
    console.log('Starting GET request to /api/clients');
    
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

    console.log('Testing Stripe connection...');
    console.log('Using Stripe key ending in:', process.env.STRIPE_SECRET_KEY?.slice(-4));
    
    // Test Stripe connection first
    let testCustomer;
    try {
      testCustomer = await stripe.customers.list({ limit: 1 });
      console.log('Stripe connection successful');
      console.log('Found customers in test:', testCustomer.data.length);
      if (testCustomer.data.length > 0) {
        console.log('Sample customer:', JSON.stringify(testCustomer.data[0], null, 2));
      } else {
        console.log('No customers found in test');
      }
    } catch (stripeError) {
      console.error('Stripe connection test failed:', stripeError);
      console.error('Full Stripe error:', JSON.stringify(stripeError, null, 2));
      return new NextResponse(
        JSON.stringify({ 
          error: 'Failed to connect to Stripe',
          details: process.env.NODE_ENV === 'development' ? stripeError.message : undefined
        }),
        { status: 500 }
      );
    }

    // Fetch customers from Stripe with their subscriptions
    console.log('Fetching all customers...');
    const customers = await stripe.customers.list({
      limit: 100,
      expand: ['data.subscriptions']
    });

    console.log(`Found ${customers.data.length} customers in Stripe`);
    if (customers.data.length > 0) {
      console.log('First customer data:', JSON.stringify(customers.data[0], null, 2));
    }

    // Transform the customers data
    const clients = customers.data.map(customer => {
      const activeSubscription = customer.subscriptions?.data.find(
        sub => sub.status === 'active' || sub.status === 'trialing'
      );

      console.log(`Processing customer ${customer.id}:`, {
        name: customer.name,
        email: customer.email,
        hasSubscription: !!activeSubscription,
        subscriptionStatus: activeSubscription?.status
      });

      return {
        id: customer.id,
        name: customer.name || 'Unnamed Client',
        email: customer.email,
        status: activeSubscription ? 'Active' : 'Inactive',
        subscriptionId: activeSubscription?.id,
        subscriptionStatus: activeSubscription?.status,
        currentPeriodEnd: activeSubscription 
          ? new Date(activeSubscription.current_period_end * 1000).toISOString()
          : null,
        createdAt: new Date(customer.created * 1000).toISOString(),
      };
    });

    console.log(`Transformed ${clients.length} clients`);
    if (clients.length > 0) {
      console.log('Sample transformed client:', JSON.stringify(clients[0], null, 2));
    }

    const response = new NextResponse(JSON.stringify(clients), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Sending response with status 200');
    return response;

  } catch (error) {
    console.error('Error fetching clients:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { status: 500 }
    );
  }
} 