import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
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

    // Test Stripe connection
    let stripeConnected = false;
    try {
      // Try to make a simple API call to Stripe
      await stripe.customers.list({ limit: 1 });
      stripeConnected = true;
    } catch (error) {
      console.error('Stripe connection test failed:', error);
      stripeConnected = false;
    }

    // Return settings
    return new NextResponse(
      JSON.stringify({
        stripeConnected,
        defaultCurrency: 'AUD',
        defaultPaymentTerms: 30,
        emailNotifications: true
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error fetching settings:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to fetch settings',
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
    
    // Here you would typically save these settings to your database
    // For now, we'll just echo them back
    return new NextResponse(
      JSON.stringify({
        success: true,
        settings: body
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error saving settings:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to save settings',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { status: 500 }
    );
  }
} 