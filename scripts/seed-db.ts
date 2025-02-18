import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import 'dotenv/config';

async function seedDatabase() {
  try {
    const sql = neon(process.env.POSTGRES_URL!);
    const db = drizzle(sql);

    console.log('Starting to seed clients...');

    // Insert sample clients
    await sql`
      INSERT INTO clients (
        name, company, email, phone, type, status, notes, last_project,
        billing_address, shipping_address, tax_number, currency, payment_terms,
        credit_limit, website, industry, account_manager, total_revenue,
        outstanding_balance, created_at
      ) VALUES 
      (
        'John Smith',
        'Tech Solutions Inc',
        'john.smith@techsolutions.com',
        '+1-555-0123',
        'business',
        'active',
        'Enterprise client with multiple ongoing projects',
        '2024-02-15',
        '123 Business Ave, Suite 100, San Francisco, CA 94105',
        '123 Business Ave, Suite 100, San Francisco, CA 94105',
        'US123456789',
        'USD',
        30,
        50000.00,
        'www.techsolutions.com',
        'Technology',
        'Sarah Johnson',
        150000.00,
        25000.00,
        NOW()
      ),
      (
        'Emma Wilson',
        'Creative Agency Co',
        'emma@creativeagency.co',
        '+1-555-0124',
        'agency',
        'active',
        'Specializes in branding projects',
        '2024-03-01',
        '456 Design Street, New York, NY 10013',
        '456 Design Street, New York, NY 10013',
        'US987654321',
        'USD',
        15,
        25000.00,
        'www.creativeagency.co',
        'Creative Services',
        'Michael Brown',
        75000.00,
        12000.00,
        NOW()
      ),
      (
        'David Lee',
        NULL,
        'david.lee@freelance.com',
        '+1-555-0125',
        'individual',
        'active',
        'Independent contractor for web development',
        '2024-02-28',
        '789 Freelance Lane, Austin, TX 78701',
        '789 Freelance Lane, Austin, TX 78701',
        NULL,
        'USD',
        7,
        5000.00,
        'www.davidlee.dev',
        'Web Development',
        'Sarah Johnson',
        15000.00,
        2500.00,
        NOW()
      )
    `;

    console.log('Successfully seeded clients');
    
    // Get the inserted clients to use their IDs for invoices
    const clients = await sql`
      SELECT id, name FROM clients ORDER BY created_at DESC LIMIT 3;
    `;
    
    console.log('Inserted clients:', clients);

    console.log('Starting to seed invoices...');

    for (const client of clients) {
      // Create a paid invoice
      const paidInvoice = await sql`
        INSERT INTO invoices (
          client_id, invoice_number, status, issue_date, due_date,
          subtotal, tax_rate, tax_amount, total, notes, terms,
          created_at
        ) VALUES (
          ${client.id},
          ${`INV-${Date.now()}-${client.id}-1`},
          'paid',
          NOW(),
          NOW() + INTERVAL '30 days',
          1000.00,
          10.00,
          100.00,
          1100.00,
          'Thank you for your business!',
          'Net 30',
          NOW()
        ) RETURNING id
      `;

      // Add items to the paid invoice
      await sql`
        INSERT INTO invoice_items (
          invoice_id, description, quantity, unit_price, amount
        ) VALUES
        (
          ${paidInvoice[0].id},
          'Web Development Services',
          10,
          75.00,
          750.00
        ),
        (
          ${paidInvoice[0].id},
          'UI/UX Design',
          5,
          50.00,
          250.00
        )
      `;

      // Add payment for the paid invoice
      await sql`
        INSERT INTO invoice_payments (
          invoice_id, amount, payment_date, payment_method,
          reference, notes
        ) VALUES (
          ${paidInvoice[0].id},
          1100.00,
          NOW(),
          'bank_transfer',
          ${`TRX-${Date.now()}`},
          'Payment received in full'
        )
      `;

      // Create an overdue invoice
      const overdueInvoice = await sql`
        INSERT INTO invoices (
          client_id, invoice_number, status, issue_date, due_date,
          subtotal, tax_rate, tax_amount, total, notes, terms,
          created_at
        ) VALUES (
          ${client.id},
          ${`INV-${Date.now()}-${client.id}-2`},
          'overdue',
          NOW() - INTERVAL '45 days',
          NOW() - INTERVAL '15 days',
          2000.00,
          10.00,
          200.00,
          2200.00,
          'Payment overdue. Please pay immediately.',
          'Net 30',
          NOW() - INTERVAL '45 days'
        ) RETURNING id
      `;

      // Add items to the overdue invoice
      await sql`
        INSERT INTO invoice_items (
          invoice_id, description, quantity, unit_price, amount
        ) VALUES
        (
          ${overdueInvoice[0].id},
          'Website Maintenance',
          1,
          1500.00,
          1500.00
        ),
        (
          ${overdueInvoice[0].id},
          'SEO Services',
          1,
          500.00,
          500.00
        )
      `;

      // Create a draft invoice
      const draftInvoice = await sql`
        INSERT INTO invoices (
          client_id, invoice_number, status, issue_date, due_date,
          subtotal, tax_rate, tax_amount, total, notes, terms,
          created_at
        ) VALUES (
          ${client.id},
          ${`INV-${Date.now()}-${client.id}-3`},
          'draft',
          NOW(),
          NOW() + INTERVAL '30 days',
          3000.00,
          10.00,
          300.00,
          3300.00,
          'Draft invoice for review',
          'Net 30',
          NOW()
        ) RETURNING id
      `;

      // Add items to the draft invoice
      await sql`
        INSERT INTO invoice_items (
          invoice_id, description, quantity, unit_price, amount
        ) VALUES
        (
          ${draftInvoice[0].id},
          'Mobile App Development',
          1,
          2500.00,
          2500.00
        ),
        (
          ${draftInvoice[0].id},
          'Project Management',
          10,
          50.00,
          500.00
        )
      `;
    }

    console.log('Successfully seeded invoices and related data');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

seedDatabase()
  .then(() => {
    console.log('Database seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }); 