import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { stripe } from '@/lib/stripe';

interface Activity {
  id: string;
  type: string;
  clientName: string;
  status: string;
  timestamp: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    // Fetch recent events from Stripe
    const events = await stripe.events.list({
      limit: 10,
      type: 'charge.succeeded,invoice.paid,customer.subscription.created,customer.subscription.updated',
    });

    // Convert Stripe events to activities
    const activities: Activity[] = await Promise.all(events.data.map(async (event) => {
      let activity: Activity = {
        id: event.id,
        type: '',
        clientName: '',
        status: 'Completed',
        timestamp: new Date(event.created * 1000).toISOString(),
      };

      switch (event.type) {
        case 'charge.succeeded': {
          const charge = event.data.object as any;
          const customer = charge.customer ? 
            await stripe.customers.retrieve(charge.customer as string) : 
            null;
          activity.type = 'Payment received';
          activity.clientName = customer?.name || customer?.email || 'Unknown client';
          break;
        }
        case 'invoice.paid': {
          const invoice = event.data.object as any;
          const customer = invoice.customer ?
            await stripe.customers.retrieve(invoice.customer as string) :
            null;
          activity.type = 'Invoice paid';
          activity.clientName = customer?.name || customer?.email || 'Unknown client';
          break;
        }
        case 'customer.subscription.created': {
          const subscription = event.data.object as any;
          const customer = subscription.customer ?
            await stripe.customers.retrieve(subscription.customer as string) :
            null;
          activity.type = 'New subscription started';
          activity.clientName = customer?.name || customer?.email || 'Unknown client';
          break;
        }
        case 'customer.subscription.updated': {
          const subscription = event.data.object as any;
          const customer = subscription.customer ?
            await stripe.customers.retrieve(subscription.customer as string) :
            null;
          activity.type = 'Subscription updated';
          activity.clientName = customer?.name || customer?.email || 'Unknown client';
          if (subscription.status === 'past_due') {
            activity.status = 'Past Due';
          } else if (subscription.status === 'unpaid') {
            activity.status = 'Unpaid';
          } else if (subscription.status === 'trialing') {
            activity.status = 'Trial';
          }
          break;
        }
      }

      return activity;
    }));

    // Filter out activities with empty types (events we don't want to show)
    const validActivities = activities.filter(activity => activity.type);

    return new NextResponse(JSON.stringify(validActivities), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    );
  }
} 