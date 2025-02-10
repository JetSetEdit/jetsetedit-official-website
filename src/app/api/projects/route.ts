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

    // Fetch customers from Stripe to get client information
    const customers = await stripe.customers.list({
      limit: 100,
      expand: ['data.subscriptions']
    });

    // For now, we'll create a project for each active client
    // Later, this will be replaced with actual project data from your database
    const projects = customers.data
      .filter(customer => customer.metadata?.status !== 'Inactive' && !customer.deleted)
      .map(customer => ({
        id: `proj_${customer.id}`,
        name: `${customer.name || 'Unnamed Client'}'s Project`,
        clientId: customer.id,
        clientName: customer.name || 'Unnamed Client',
        status: 'Active' as const,
        startDate: new Date(customer.created * 1000).toISOString(),
        dueDate: customer.subscriptions?.data[0]?.current_period_end 
          ? new Date(customer.subscriptions.data[0].current_period_end * 1000).toISOString()
          : null,
        description: 'Video editing project',
        createdAt: new Date(customer.created * 1000).toISOString(),
      }));

    return new NextResponse(
      JSON.stringify(projects),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error fetching projects:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to fetch projects',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');
    const body = await request.json();
    const { status } = body;

    if (!projectId || !status) {
      return new NextResponse(
        JSON.stringify({ error: 'Project ID and status are required' }),
        { status: 400 }
      );
    }

    // For now, we'll just return success since we don't have a database
    // Later, this will update the project in your database
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
    console.error('Error updating project:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to update project',
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
    const { name, clientId, description, startDate, dueDate } = body;

    if (!name || !clientId) {
      return new NextResponse(
        JSON.stringify({ error: 'Name and client ID are required' }),
        { status: 400 }
      );
    }

    // For now, we'll just return a mock response
    // Later, this will create a project in your database
    const project = {
      id: `proj_${Date.now()}`,
      name,
      clientId,
      clientName: 'Client Name', // You'll need to fetch this
      status: 'Active' as const,
      startDate: startDate || new Date().toISOString(),
      dueDate: dueDate || null,
      description: description || '',
      createdAt: new Date().toISOString(),
    };

    return new NextResponse(
      JSON.stringify(project),
      { 
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error creating project:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to create project',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { status: 500 }
    );
  }
} 