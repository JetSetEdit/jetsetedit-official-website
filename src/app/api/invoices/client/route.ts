import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';

export async function GET() {
  try {
    console.log('Starting GET request to /api/invoices/client');
    
    const session = await getServerSession(authOptions);
    console.log('Session:', {
      exists: !!session,
      user: session?.user,
      stripeCustomerId: session?.user?.stripeCustomerId
    });
    
    if (!session) {
      console.log('No session found, returning 401');
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const customerId = session.user?.stripeCustomerId;
    console.log('Customer ID:', customerId);
    
    if (!customerId) {
      console.log('No Stripe customer ID found');
      return new NextResponse(
        JSON.stringify({ 
          error: 'No customer ID found',
          details: 'User is not properly set up with Stripe'
        }),
        { status: 400 }
      );
    }

    console.log('Fetching invoices from Stripe for customer:', customerId);
    
    // Test Stripe connection first
    try {
      const customer = await stripe.customers.retrieve(customerId);
      console.log('Successfully verified customer exists in Stripe:', customer.id);
    } catch (stripeError) {
      console.error('Error verifying Stripe customer:', stripeError);
      return new NextResponse(
        JSON.stringify({ 
          error: 'Invalid customer ID',
          details: 'Customer not found in Stripe'
        }),
        { status: 400 }
      );
    }

    // Fetch all invoices for the customer from Stripe
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 100,
      expand: ['data.subscription']
    });

    console.log(`Found ${invoices.data.length} invoices`);

    // If no invoices found, return an empty array with 200 status
    if (invoices.data.length === 0) {
      console.log('No invoices found for customer, returning empty array');
      return new NextResponse(
        JSON.stringify([]),
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Transform the invoices data
    const transformedInvoices = invoices.data.map(invoice => ({
      id: invoice.id,
      number: invoice.number,
      amount: invoice.amount_due / 100,
      currency: invoice.currency,
      status: invoice.status,
      dueDate: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null,
      paidAt: invoice.status === 'paid' ? new Date(invoice.status_transitions.paid_at! * 1000).toISOString() : null,
      createdAt: new Date(invoice.created * 1000).toISOString(),
      description: invoice.description,
      hostedUrl: invoice.hosted_invoice_url,
      pdfUrl: invoice.invoice_pdf,
      subscription: invoice.subscription ? {
        id: (invoice.subscription as any).id,
        status: (invoice.subscription as any).status,
      } : null,
    }));

    console.log('Successfully transformed invoices data');

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
    console.error('Error in GET /api/invoices/client:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
    
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to fetch invoices',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
      }),
      { status: 500 }
    );
  }
}
