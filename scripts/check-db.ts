import { db, clients, products, invoices } from '../lib/db';

async function checkTables() {
  console.log('Checking database tables...\n');

  // Check clients
  const allClients = await db.select().from(clients);
  console.log(`Found ${allClients.length} clients`);
  if (allClients.length > 0) {
    console.log('Sample client:', allClients[0]);
  }

  // Check products
  const allProducts = await db.select().from(products);
  console.log(`\nFound ${allProducts.length} products`);
  if (allProducts.length > 0) {
    console.log('Sample product:', allProducts[0]);
  }

  // Check invoices
  const allInvoices = await db.select().from(invoices);
  console.log(`\nFound ${allInvoices.length} invoices`);
  if (allInvoices.length > 0) {
    console.log('Sample invoice:', allInvoices[0]);
  }
}

checkTables().catch(console.error); 