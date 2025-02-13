import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    console.log('Fetching Stripe products and prices...');
    
    // Fetch all active products with their prices
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
    });

    console.log(`Found ${products.data.length} active products`);

    // Transform the products data
    const plans = products.data.map(product => {
      const price = product.default_price as any;
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        priceId: price?.id,
        unitAmount: price?.unit_amount ? price.unit_amount / 100 : null,
        currency: price?.currency,
        interval: price?.recurring?.interval,
        intervalCount: price?.recurring?.interval_count,
        features: product.features?.map(feature => feature.name) || [],
        metadata: product.metadata,
      };
    });

    console.log('Transformed plans:', plans);

    return new NextResponse(
      JSON.stringify(plans),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to fetch subscription plans',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { status: 500 }
    );
  }
} 