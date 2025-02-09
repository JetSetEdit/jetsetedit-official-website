import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
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
    const { subscriptionItemId, hours, timestamp } = body;

    if (!subscriptionItemId || typeof hours !== 'number') {
      return new NextResponse(
        JSON.stringify({ error: 'Subscription item ID and hours are required' }),
        { status: 400 }
      );
    }

    console.log('Reporting usage...', { subscriptionItemId, hours, timestamp });

    // Create usage record
    const usageRecord = await stripe.subscriptionItems.createUsageRecord(
      subscriptionItemId,
      {
        quantity: hours,
        timestamp: timestamp ? Math.floor(new Date(timestamp).getTime() / 1000) : 'now',
        action: 'increment', // This will add to the existing usage
      }
    );

    console.log('Usage record created:', usageRecord);

    return new NextResponse(
      JSON.stringify({
        success: true,
        usageRecord: usageRecord
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error reporting usage:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to report usage',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { status: 500 }
    );
  }
} 