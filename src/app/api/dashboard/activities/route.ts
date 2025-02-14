import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { stripe } from '@/lib/stripe';

interface Activity {
  id: string;
  type: string;
  clientName: string;
  status: string;
  timestamp: string;
}

export async function GET() {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get recent activities from Stripe
    const events = await stripe.events.list({
      limit: 10,
      type: 'charge.succeeded'
    });

    const activities: Activity[] = events.data.map(event => ({
      id: event.id,
      type: 'Payment',
      clientName: (event.data.object as any).billing_details?.name || 'Unknown',
      status: 'Completed',
      timestamp: new Date(event.created * 1000).toISOString()
    }));

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
} 