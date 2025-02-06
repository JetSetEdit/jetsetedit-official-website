import { NextResponse } from 'next/server';
import { 
  createCustomer, 
  createHourlyProduct, 
  createHourlyPrice, 
  createHourlySubscription,
  updateSubscriptionHours,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  getUpcomingInvoice
} from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const {
      email,
      name,
      hourlyRate,
      hoursPerInterval,
      productName,
      productDescription,
    } = await req.json();

    // Create a customer
    const customer = await createCustomer(email, name);

    // Create a product for the hourly service
    const product = await createHourlyProduct(
      productName || 'Hourly Service',
      productDescription
    );

    // Create a price for the hourly rate
    const price = await createHourlyPrice(product.id, hourlyRate);

    // Create a subscription
    const subscription = await createHourlySubscription(
      customer.id,
      price.id,
      hoursPerInterval || 1
    );

    return NextResponse.json({
      customerId: customer.id,
      subscriptionId: subscription.id,
      clientSecret: (subscription as any).latest_invoice.payment_intent.client_secret,
    });
  } catch (err) {
    console.error('Error creating subscription:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { subscriptionId, hoursPerInterval } = await req.json();
    
    const subscription = await updateSubscriptionHours(
      subscriptionId,
      hoursPerInterval
    );

    return NextResponse.json(subscription);
  } catch (err) {
    console.error('Error updating subscription:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { subscriptionId, action } = await req.json();
    
    let subscription;
    switch (action) {
      case 'pause':
        subscription = await pauseSubscription(subscriptionId);
        break;
      case 'resume':
        subscription = await resumeSubscription(subscriptionId);
        break;
      default:
        throw new Error('Invalid action');
    }

    return NextResponse.json(subscription);
  } catch (err) {
    console.error('Error modifying subscription:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { subscriptionId } = await req.json();
    
    const subscription = await cancelSubscription(subscriptionId);

    return NextResponse.json(subscription);
  } catch (err) {
    console.error('Error cancelling subscription:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const customerId = url.searchParams.get('customerId');
    const subscriptionId = url.searchParams.get('subscriptionId');
    const newPriceId = url.searchParams.get('newPriceId');
    const newQuantity = url.searchParams.get('newQuantity');

    if (!customerId) {
      throw new Error('Customer ID is required');
    }

    const upcomingInvoice = await getUpcomingInvoice(
      customerId,
      subscriptionId || undefined,
      newPriceId || undefined,
      newQuantity ? parseInt(newQuantity) : undefined
    );

    return NextResponse.json(upcomingInvoice);
  } catch (err) {
    console.error('Error getting upcoming invoice:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 }
    );
  }
} 