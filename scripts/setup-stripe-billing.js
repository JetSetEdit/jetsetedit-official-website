const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function setupStripeBilling() {
  try {
    // Create the product
    console.log('Creating video editing service product...');
    const product = await stripe.products.create({
      name: 'Video Editing Service',
      description: 'Professional video editing service billed by the hour',
      metadata: {
        type: 'hourly_service'
      }
    });
    console.log('Product created:', product.id);

    // Create the metered price
    console.log('Creating metered price...');
    const price = await stripe.prices.create({
      product: product.id,
      currency: 'usd',
      unit_amount: 5000, // $50.00 per hour
      recurring: {
        interval: 'month',
        usage_type: 'metered',
        aggregate_usage: 'sum'
      },
      metadata: {
        type: 'hourly_rate'
      }
    });
    console.log('Price created:', price.id);

    console.log('\nSetup completed successfully!');
    console.log('Product ID:', product.id);
    console.log('Price ID:', price.id);
    console.log('\nYou can now use these IDs in your application.');

  } catch (error) {
    console.error('Error setting up Stripe billing:', error);
  }
}

setupStripeBilling(); 