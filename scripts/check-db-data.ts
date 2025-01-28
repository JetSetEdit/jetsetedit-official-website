import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import 'dotenv/config';

async function checkDatabaseData() {
  try {
    const sql = neon(process.env.POSTGRES_URL!);
    const db = drizzle(sql);

    // Get all clients
    console.log('\n=== Clients ===');
    const clients = await sql`
      SELECT id, name, company, email, type, status
      FROM clients
      ORDER BY created_at DESC;
    `;
    console.log(clients);

    // Get all invoices with client names
    console.log('\n=== Invoices ===');
    const invoices = await sql`
      SELECT i.id, i.invoice_number, i.status, i.total, 
             c.name as client_name, i.created_at
      FROM invoices i
      JOIN clients c ON i.client_id = c.id
      ORDER BY i.created_at DESC;
    `;
    console.log(invoices);

    // Get all invoice items
    console.log('\n=== Invoice Items ===');
    const invoiceItems = await sql`
      SELECT ii.*, i.invoice_number
      FROM invoice_items ii
      JOIN invoices i ON ii.invoice_id = i.id
      ORDER BY i.created_at DESC;
    `;
    console.log(invoiceItems);

    // Get all payments
    console.log('\n=== Payments ===');
    const payments = await sql`
      SELECT p.*, i.invoice_number
      FROM invoice_payments p
      JOIN invoices i ON p.invoice_id = i.id
      ORDER BY p.payment_date DESC;
    `;
    console.log(payments);

    // Get summary statistics
    console.log('\n=== Summary Statistics ===');
    const stats = await sql`
      SELECT
        (SELECT COUNT(*) FROM clients) as total_clients,
        (SELECT COUNT(*) FROM invoices) as total_invoices,
        (SELECT COUNT(*) FROM invoice_items) as total_invoice_items,
        (SELECT COUNT(*) FROM invoice_payments) as total_payments,
        (SELECT SUM(total) FROM invoices) as total_invoice_amount,
        (SELECT SUM(amount) FROM invoice_payments) as total_payments_received;
    `;
    console.log(stats[0]);

  } catch (error) {
    console.error('Error checking database:', error);
    throw error;
  }
}

checkDatabaseData()
  .then(() => {
    console.log('\nDatabase check completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database check failed:', error);
    process.exit(1);
  }); 