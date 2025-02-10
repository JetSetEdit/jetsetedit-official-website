import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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

    // Fetch all customers
    const customers = await stripe.customers.list({
      limit: 100,
      expand: ['data.subscriptions']
    });

    // Count active clients (based on metadata status or default to Active)
    const activeClients = customers.data.filter(customer => 
      customer.metadata?.status !== 'Inactive' && !customer.deleted
    ).length;

    // Calculate monthly revenue from active subscriptions
    const monthlyRevenue = customers.data.reduce((total, customer) => {
      const activeSubscription = customer.subscriptions?.data.find(
        sub => sub.status === 'active' || sub.status === 'trialing'
      );
      if (activeSubscription) {
        return total + (activeSubscription.items.data[0].price.unit_amount || 0) / 100;
      }
      return total;
    }, 0);

    // For now, active projects is same as active clients until we implement project tracking
    const activeProjects = activeClients;

    return new NextResponse(
      JSON.stringify({
        activeClients,
        monthlyRevenue,
        activeProjects
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to fetch dashboard stats',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { status: 500 }
    );
  }
} 