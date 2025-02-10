import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';

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
    const { invoiceId, amount, reason, description } = body;

    if (!invoiceId || !amount) {
      return new NextResponse(
        JSON.stringify({ error: 'Invoice ID and amount are required' }),
        { status: 400 }
      );
    }

    // Create a credit note
    const creditNote = await stripe.creditNotes.create({
      invoice: invoiceId,
      amount: Math.round(amount * 100), // Convert to cents
      reason: reason || 'duplicate',
      description: description || 'Credit note for invoice adjustment',
    });

    return new NextResponse(
      JSON.stringify({
        success: true,
        creditNote,
      }),
      { 
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error creating credit note:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to create credit note',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get('invoiceId');

    if (!invoiceId) {
      return new NextResponse(
        JSON.stringify({ error: 'Invoice ID is required' }),
        { status: 400 }
      );
    }

    // Get credit notes for the invoice
    const creditNotes = await stripe.creditNotes.list({
      invoice: invoiceId,
    });

    return new NextResponse(
      JSON.stringify(creditNotes),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error fetching credit notes:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to fetch credit notes',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { status: 500 }
    );
  }
} 