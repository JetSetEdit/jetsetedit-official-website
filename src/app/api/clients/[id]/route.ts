import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';

export async function GET(
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

    const { id } = params;

    // Fetch customer from Stripe
    const customer = await stripe.customers.retrieve(id, {
      expand: ['subscriptions']
    });

    if (!customer || customer.deleted) {
      return new NextResponse(
        JSON.stringify({ error: 'Client not found' }),
        { status: 404 }
      );
    }

    // Transform the data
    const transformedClient = {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      status: customer.metadata.status || 'Active',
      subscriptions: (customer as any).subscriptions?.data?.map((sub: any) => ({
        id: sub.id,
        status: sub.status,
        currentPeriodStart: new Date(sub.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
        plan: {
          id: sub.items.data[0].price.id,
          name: sub.items.data[0].price.nickname || 'Video Editing Service',
          amount: sub.items.data[0].price.unit_amount ? sub.items.data[0].price.unit_amount / 100 : 0,
          currency: sub.items.data[0].price.currency,
          interval: sub.items.data[0].price.recurring?.interval || 'month',
        }
      })) || [],
      createdAt: new Date(customer.created * 1000).toISOString(),
      metadata: customer.metadata || {}
    };

    return new NextResponse(
      JSON.stringify(transformedClient),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error fetching client:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to fetch client',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return new NextResponse(
        JSON.stringify({ error: 'Status is required' }),
        { status: 400 }
      );
    }

    // Update customer metadata in Stripe
    const customer = await stripe.customers.update(id, {
      metadata: {
        status,
      },
    });

    return new NextResponse(
      JSON.stringify({ success: true, customer }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
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

export async function DELETE(
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

    const { id } = params;

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
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
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