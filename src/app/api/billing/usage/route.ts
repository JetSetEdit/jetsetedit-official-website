import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { stripe } from '@/lib/stripe';

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
    const subscriptionId = searchParams.get('subscriptionId');

    if (!subscriptionId) {
      return new NextResponse(
        JSON.stringify({ error: 'Subscription ID is required' }),
        { status: 400 }
      );
    }

    console.log('Fetching usage for subscription:', subscriptionId);

    // Get subscription with items
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['items.data.price'],
    });

    // Get usage records for each subscription item
    const usagePromises = subscription.items.data.map(async (item) => {
      const price = item.price as any;
      if (price.recurring?.usage_type === 'metered') {
        const usageRecords = await stripe.subscriptionItems.listUsageRecordSummaries(
          item.id,
          { limit: 100 }
        );
        return {
          itemId: item.id,
          priceId: item.price.id,
          priceName: price.nickname || 'Hourly Rate',
          unitAmount: price.unit_amount ? price.unit_amount / 100 : 0,
          currency: price.currency,
          usage: usageRecords.data,
          currentPeriodStart: subscription.current_period_start,
          currentPeriodEnd: subscription.current_period_end,
        };
      }
      return null;
    });

    const usageData = (await Promise.all(usagePromises)).filter(Boolean);

    console.log('Usage data:', usageData);

    return new NextResponse(
      JSON.stringify({
        subscriptionId,
        usageData,
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error fetching usage:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to fetch usage',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { status: 500 }
    );
  }
} 