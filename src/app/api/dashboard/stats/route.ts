import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { stripe } from '@/lib/stripe';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    console.log('Fetching Stripe data...');

    try {
      // Test Stripe connection
      await stripe.customers.list({ limit: 1 });
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

    // Fetch active customers
    console.log('Fetching customers...');
    const customers = await stripe.customers.list({
      limit: 100,
      expand: ['data.subscriptions']
    });

    // Calculate active clients (customers with active subscriptions)
    const activeClients = customers.data.filter(customer => 
      customer.subscriptions?.data.some(sub => 
        sub.status === 'active' || sub.status === 'trialing'
      )
    ).length;

    console.log('Fetching subscriptions...');
    // Calculate monthly revenue from active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      status: 'active',
      expand: ['data.items.data.price']
    });

    const monthlyRevenue = subscriptions.data.reduce((total, subscription) => {
      const amount = subscription.items.data.reduce((subTotal, item) => {
        const price = item.price as any; // Type assertion for price object
        return subTotal + (price.unit_amount * item.quantity);
      }, 0);
      return total + amount;
    }, 0) / 100; // Convert from cents to dollars

    // Count active projects (subscriptions)
    const activeProjects = subscriptions.data.length;

    console.log('Stats calculated:', { activeClients, monthlyRevenue, activeProjects });

    const stats = {
      activeClients,
      monthlyRevenue,
      activeProjects
    };

    return new NextResponse(JSON.stringify(stats), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
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