import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { createApiResponse, handleApiError } from '@/lib/api/response';
import { verifyAdminRole } from '@/lib/middleware/adminAuth';

export async function GET(request: Request) {
  try {
    const session = await verifyAdminRole();
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('subscriptionId');

    if (!subscriptionId) {
      return createApiResponse({ error: 'Subscription ID is required' }, 400);
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

    return createApiResponse({
      subscriptionId,
      usageData,
    });

  } catch (error) {
    return handleApiError(error, 'Failed to fetch usage');
  }
} 