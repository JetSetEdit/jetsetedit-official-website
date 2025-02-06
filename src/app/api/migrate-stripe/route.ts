import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// Initialize Stripe with live key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    console.log('Starting Stripe migration check...');
    console.log('Using Stripe key ending in:', process.env.STRIPE_SECRET_KEY?.slice(-4));
    
    // Test Stripe connection
    console.log('Testing Stripe connection...');
    const testCustomer = await stripe.customers.list({ limit: 1 });
    console.log('Stripe connection successful');
    console.log('Sample customer:', JSON.stringify(testCustomer.data[0], null, 2));

    // Fetch all customers from Stripe
    console.log('Fetching all customers...');
    const customers = await stripe.customers.list({
      limit: 100,
      expand: ['data.subscriptions']
    });

    console.log(`Found ${customers.data.length} customers in Stripe`);

    // Transform and log customer data
    const customerData = customers.data.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      created: new Date(customer.created * 1000).toISOString(),
      metadata: customer.metadata,
      subscriptions: customer.subscriptions?.data.map(sub => ({
        id: sub.id,
        status: sub.status,
        currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
        items: sub.items.data.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price.id
        }))
      }))
    }));

    console.log('Customer details:');
    customerData.forEach(customer => {
      console.log(`\nCustomer: ${customer.name} (${customer.email})`);
      console.log(`ID: ${customer.id}`);
      console.log(`Created: ${customer.created}`);
      console.log('Subscriptions:', customer.subscriptions?.length || 0);
      customer.subscriptions?.forEach(sub => {
        console.log(`- Subscription ${sub.id}: ${sub.status}`);
      });
    });

    return new NextResponse(
      JSON.stringify({
        message: 'Migration check completed',
        customerCount: customers.data.length,
        customers: customerData
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Migration check error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Migration check failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { status: 500 }
    );
  }
} 