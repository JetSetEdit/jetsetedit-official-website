const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createTestSubscription() {
  try {
    // Create a test customer
    console.log('Creating test customer...');
    const customer = await stripe.customers.create({
      email: 'test@example.com',
      name: 'Test Client',
      metadata: {
        type: 'test_account'
      }
    });
    console.log('Customer created:', customer.id);

    // Create a subscription with the metered price
    console.log('Creating subscription...');
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: 'price_1QqUFkAVc47ah8I1bv80cm3E' }], // Use the price ID from setup
      metadata: {
        type: 'test_subscription'
      }
    });
    console.log('Subscription created:', subscription.id);

    // Get the subscription item ID
    const subscriptionItemId = subscription.items.data[0].id;

    // Report some test usage
    console.log('Adding test usage data...');
    
    // Use current timestamp for usage records
    const now = Math.floor(Date.now() / 1000);
    const usageRecords = await Promise.all([
      // Add first batch of hours
      stripe.subscriptionItems.createUsageRecord(subscriptionItemId, {
        quantity: 3,
        timestamp: now,
        action: 'increment'
      })
    ]);
    
    // Wait a second before adding more hours
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Add second batch of hours
    const secondUsageRecord = await stripe.subscriptionItems.createUsageRecord(
      subscriptionItemId,
      {
        quantity: 2,
        timestamp: Math.floor(Date.now() / 1000),
        action: 'increment'
      }
    );
    
    console.log('Usage records created successfully');

    console.log('\nTest data created successfully!');
    console.log('Customer ID:', customer.id);
    console.log('Subscription ID:', subscription.id);
    console.log('Subscription Item ID:', subscriptionItemId);
    console.log('\nTo view the billing interface, use this subscription ID:', subscription.id);

  } catch (error) {
    console.error('Error creating test data:', error);
    if (error.raw) {
      console.error('Error details:', error.raw.message);
    }
  }
}

createTestSubscription(); 