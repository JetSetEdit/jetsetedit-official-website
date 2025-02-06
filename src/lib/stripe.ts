import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

console.log('Initializing Stripe with API version 2023-10-16');

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // Using the latest stable API version
  typescript: true,
});

// Test the stripe connection on initialization
stripe.customers.list({ limit: 1 })
  .then(() => console.log('Stripe connection test successful'))
  .catch(error => console.error('Stripe connection test failed:', error.message));

export type HourlyRate = {
  id: string;
  amount: number;
  currency: string;
  interval: 'hour';
  nickname?: string;
};

export async function createHourlyProduct(name: string, description?: string) {
  const product = await stripe.products.create({
    name,
    description,
    type: 'service',
  });
  return product;
}

export async function createHourlyPrice(productId: string, hourlyRate: number, currency: string = 'USD') {
  const price = await stripe.prices.create({
    product: productId,
    unit_amount: hourlyRate * 100, // Convert to cents
    currency,
    recurring: {
      interval: 'hour',
    },
  });
  return price;
}

export async function createCustomer(email: string, name?: string, metadata?: Record<string, string>) {
  const customer = await stripe.customers.create({
    email,
    name,
    metadata,
  });
  return customer;
}

export async function createHourlySubscription(
  customerId: string, 
  priceId: string,
  hoursPerInterval: number = 1,
  metadata?: Record<string, string>
) {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{
      price: priceId,
      quantity: hoursPerInterval,
    }],
    metadata,
    payment_behavior: 'default_incomplete',
    payment_settings: {
      save_default_payment_method: 'on_subscription',
    },
    expand: ['latest_invoice.payment_intent'],
  });
  return subscription;
}

export async function updateSubscriptionHours(
  subscriptionId: string,
  hoursPerInterval: number
) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const subscriptionItem = subscription.items.data[0];
  
  await stripe.subscriptionItems.update(subscriptionItem.id, {
    quantity: hoursPerInterval,
  });
  
  return subscription;
}

export async function pauseSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    pause_collection: {
      behavior: 'void',
    },
  });
  return subscription;
}

export async function resumeSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    pause_collection: null,
  });
  return subscription;
}

export async function cancelSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.cancel(subscriptionId);
  return subscription;
}

export async function getUpcomingInvoice(
  customerId: string,
  subscriptionId?: string,
  newPriceId?: string,
  newQuantity?: number
) {
  const params: Stripe.UpcomingInvoiceParams = {
    customer: customerId,
  };

  if (subscriptionId) {
    params.subscription = subscriptionId;
  }

  if (newPriceId || newQuantity) {
    params.subscription_items = [{
      id: subscriptionId ? (await stripe.subscriptions.retrieve(subscriptionId)).items.data[0].id : undefined,
      price: newPriceId,
      quantity: newQuantity,
    }];
  }

  const upcomingInvoice = await stripe.invoices.retrieveUpcoming(params);
  return upcomingInvoice;
} 