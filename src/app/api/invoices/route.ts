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

    // Fetch all invoices from Stripe
    const invoices = await stripe.invoices.list({
      limit: 100,
      expand: ['data.customer', 'data.subscription']
    });

    // Transform the invoices data
    const transformedInvoices = invoices.data.map(invoice => {
      const customer = invoice.customer as any;
      const isCustomerDeleted = customer?.deleted || false;

      return {
        id: invoice.id,
        number: invoice.number,
        customerId: customer?.id,
        customerName: customer?.name || 'Unknown Customer',
        customerEmail: customer?.email,
        amount: invoice.amount_due / 100,
        currency: invoice.currency,
        status: invoice.status,
        dueDate: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null,
        paidAt: invoice.status === 'paid' ? new Date(invoice.status_transitions.paid_at! * 1000).toISOString() : null,
        createdAt: new Date(invoice.created * 1000).toISOString(),
        hostedUrl: invoice.hosted_invoice_url,
        pdfUrl: invoice.invoice_pdf,
        description: invoice.description,
        subscription: invoice.subscription ? {
          id: (invoice.subscription as any).id,
          status: (invoice.subscription as any).status,
        } : null,
        isCustomerDeleted,
      };
    });

    return new NextResponse(
      JSON.stringify(transformedInvoices),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error fetching invoices:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to fetch invoices',
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
    const { customerId, description, dueDate } = body;

    if (!customerId) {
      return new NextResponse(
        JSON.stringify({ error: 'Customer ID is required' }),
        { status: 400 }
      );
    }

    // Create a draft invoice
    const invoice = await stripe.invoices.create({
      customer: customerId,
      collection_method: 'send_invoice',
      days_until_due: 30,
      description: description || 'Video editing services',
      auto_advance: false, // Draft invoice
    });

    // If due date is provided, update it
    if (dueDate) {
      await stripe.invoices.update(invoice.id, {
        due_date: Math.floor(new Date(dueDate).getTime() / 1000),
      });
    }

    return new NextResponse(
      JSON.stringify({
        success: true,
        invoice: invoice,
      }),
      { 
        status: 201,
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