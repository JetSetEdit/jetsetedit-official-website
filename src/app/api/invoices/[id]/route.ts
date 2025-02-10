import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';

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
    const { description, dueDate } = body;

    // Update invoice in Stripe
    const invoice = await stripe.invoices.update(id, {
      description,
      due_date: dueDate ? Math.floor(new Date(dueDate).getTime() / 1000) : undefined,
    });

    return new NextResponse(
      JSON.stringify({ success: true, invoice }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error updating invoice:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to update invoice',
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

    // Get the invoice first to check its status
    const invoice = await stripe.invoices.retrieve(id);

    // For test/draft invoices, we can delete them
    if (invoice.status === 'draft') {
      await stripe.invoices.del(id);
      return new NextResponse(
        JSON.stringify({ success: true, message: 'Invoice deleted successfully' }),
        { status: 200 }
      );
    }
    
    // For finalized invoices, we void them instead
    await stripe.invoices.voidInvoice(id);
    return new NextResponse(
      JSON.stringify({ success: true, message: 'Invoice voided successfully' }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting/voiding invoice:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to delete/void invoice',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const { action } = body;

    let invoice;
    switch (action) {
      case 'finalize':
        invoice = await stripe.invoices.finalizeInvoice(id);
        break;
      case 'pay':
        invoice = await stripe.invoices.pay(id);
        break;
      case 'send':
        invoice = await stripe.invoices.sendInvoice(id);
        break;
      case 'mark_uncollectible':
        invoice = await stripe.invoices.markUncollectible(id);
        break;
      default:
        return new NextResponse(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400 }
        );
    }

    return new NextResponse(
      JSON.stringify({ success: true, invoice }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error performing invoice action:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to perform invoice action',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { status: 500 }
    );
  }
} 