import { db, clients } from '../lib/db';
import Stripe from 'stripe';
import { sql } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
});

async function migrateClientsToStripe() {
  console.log('Starting client migration to Stripe...');

  // Get all clients without a Stripe customer ID
  const existingClients = await db
    .select()
    .from(clients)
    .where(sql`stripe_customer_id IS NULL`);

  console.log(`Found ${existingClients.length} clients to migrate`);

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

      console.log(`✓ Migrated client ${client.name} (ID: ${client.id}) to Stripe customer ${stripeCustomer.id}`);
    } catch (error) {
      console.error(`✗ Failed to migrate client ${client.name} (ID: ${client.id}):`, error);
    }
  }

  console.log('Migration complete!');
}

// Run the migration
migrateClientsToStripe().catch(console.error); 