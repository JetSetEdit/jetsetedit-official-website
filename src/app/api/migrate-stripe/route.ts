import { db, clients } from '@/lib/db';
import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
});

export async function POST() {
  try {
    console.log('Starting client migration to Stripe...');

    // Get all clients without a Stripe customer ID
    const existingClients = await db
      .select()
      .from(clients)
      .where(sql`stripe_customer_id IS NULL`);

    console.log(`Found ${existingClients.length} clients to migrate`);

    const results = {
      success: 0,
      failed: 0,
      details: [] as Array<{ id: number; name: string; status: 'success' | 'failed'; error?: string }>,
    };

    for (const client of existingClients) {
      try {
        // Create Stripe customer
        const stripeCustomer = await stripe.customers.create({
          name: client.name,
          email: client.email,
          phone: client.phone || undefined,
          metadata: {
            company: client.company || '',
            type: client.type,
            website: client.website || '',
          },
        });

        // Update client with Stripe customer ID
        await db
          .update(clients)
          .set({ stripeCustomerId: stripeCustomer.id })
          .where(sql`id = ${client.id}`);

        results.success++;
        results.details.push({
          id: client.id,
          name: client.name,
          status: 'success',
        });
      } catch (error) {
        results.failed++;
        results.details.push({
          id: client.id,
          name: client.name,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      message: 'Migration completed',
      results,
    });
  } catch (error) {
    console.error('Migration failed:', error);
    return NextResponse.json(
      { 
        message: 'Migration failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 