import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';

export async function GET() {
  try {
    console.log('Starting GET request to /api/clients');
    
    const session = await getServerSession(authOptions);
    console.log('Session status:', session ? 'Authenticated' : 'Not authenticated');

    if (!session) {
      console.log('No session found, returning 401');
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    // Fetch customers from Stripe with their subscriptions
    console.log('Fetching all customers...');
    const customers = await stripe.customers.list({
      limit: 100,
      expand: ['data.subscriptions']
    });

    console.log(`Found ${customers.data.length} customers in Stripe`);

    // Transform the customers data
    const clients = customers.data.map(customer => {
      const activeSubscription = customer.subscriptions?.data.find(
        sub => sub.status === 'active' || sub.status === 'trialing'
      );

      // Use metadata status if available, otherwise determine from subscription
      const status = customer.metadata?.status || (activeSubscription ? 'Active' : 'Inactive');

      return {
        id: customer.id,
        name: customer.name || 'Unnamed Client',
        email: customer.email,
        status,
        subscriptionId: activeSubscription?.id,
        subscriptionStatus: activeSubscription?.status,
        currentPeriodEnd: activeSubscription 
          ? new Date(activeSubscription.current_period_end * 1000).toISOString()
          : null,
        createdAt: new Date(customer.created * 1000).toISOString(),
        metadata: customer.metadata,
      };
    });

    return new NextResponse(JSON.stringify(clients), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching clients:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { status: 500 }
    );
  }
}

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
    const { name, email } = body;

    if (!email) {
      return new NextResponse(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400 }
      );
    }

    // Check if customer already exists
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      return new NextResponse(
        JSON.stringify({ error: 'Customer with this email already exists' }),
        { status: 400 }
      );
    }

    // Create new customer in Stripe
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        source: 'JetSetEdit Website',
      },
    });

    return new NextResponse(
      JSON.stringify(customer),
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating client:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to create client',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, name, email, metadata } = body;

    if (!id) {
      return new NextResponse(
        JSON.stringify({ error: 'Customer ID is required' }),
        { status: 400 }
      );
    }

    // Update customer in Stripe
    const customer = await stripe.customers.update(id, {
      name,
      email,
      metadata,
    });

    return new NextResponse(
      JSON.stringify(customer),
      { status: 200 }
    );

  } catch (error) {
    console.error('Error updating client:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to update client',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse(
        JSON.stringify({ error: 'Customer ID is required' }),
        { status: 400 }
      );
    }

    // Check if customer has active subscriptions
    const customer = await stripe.customers.retrieve(id, {
      expand: ['subscriptions']
    });

    if ((customer as any).subscriptions?.data.length > 0) {
      return new NextResponse(
        JSON.stringify({ error: 'Cannot delete customer with active subscriptions' }),
        { status: 400 }
      );
    }

    // Delete customer from Stripe
    await stripe.customers.del(id);

    return new NextResponse(
      JSON.stringify({ success: true }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting client:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to delete client',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { status: 500 }
    );
  }
} 