import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { createApiResponse, handleApiError } from '@/lib/api/response';
import { verifyAdminRole } from '@/lib/middleware/adminAuth';

export async function POST(request: Request) {
  try {
    const session = await verifyAdminRole();
    if (session instanceof NextResponse) return session;

    const body = await request.json();
    const { subscriptionItemId, hours, timestamp } = body;

    if (!subscriptionItemId || typeof hours !== 'number') {
      return createApiResponse({ error: 'Subscription item ID and hours are required' }, 400);
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

    return createApiResponse({
      success: true,
      usageRecord: usageRecord
    });

  } catch (error) {
    return handleApiError(error, 'Failed to report usage');
  }
} 