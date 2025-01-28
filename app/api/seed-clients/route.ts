import { db, clients } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Sample client data
    const sampleClients = [
      {
        name: 'John Smith',
        company: 'Tech Innovators LLC',
        email: 'john.smith@techinnovators.com',
        phone: '+1 (555) 123-4567',
        type: 'business',
        status: 'active',
        notes: 'Key client for web development projects',
        lastProject: '2024-01-15',
        billingAddress: '123 Business Ave\nSuite 100\nSan Francisco, CA 94105',
        shippingAddress: '123 Business Ave\nSuite 100\nSan Francisco, CA 94105',
        taxNumber: 'US123456789',
        currency: 'USD',
        paymentTerms: 30,
        creditLimit: '50000.00',
        website: 'www.techinnovators.com',
        industry: 'Technology',
        accountManager: 'Sarah Johnson',
        totalRevenue: '150000.00',
        outstandingBalance: '5000.00'
      },
      {
        name: 'Emma Wilson',
        company: 'Creative Design Studio',
        email: 'emma@creativedesign.studio',
        phone: '+1 (555) 234-5678',
        type: 'agency',
        status: 'active',
        notes: 'Regular client for design projects',
        lastProject: '2024-01-20',
        billingAddress: '456 Design Street\nFloor 3\nNew York, NY 10013',
        shippingAddress: '456 Design Street\nFloor 3\nNew York, NY 10013',
        taxNumber: 'US987654321',
        currency: 'USD',
        paymentTerms: 15,
        creditLimit: '25000.00',
        website: 'www.creativedesign.studio',
        industry: 'Design',
        accountManager: 'Michael Brown',
        totalRevenue: '75000.00',
        outstandingBalance: '2500.00'
      },
      {
        name: 'David Chen',
        email: 'david.chen@email.com',
        phone: '+1 (555) 345-6789',
        type: 'individual',
        status: 'active',
        notes: 'Freelance developer, regular client',
        lastProject: '2024-01-25',
        billingAddress: '789 Tech Road\nApt 5B\nAustin, TX 78701',
        shippingAddress: '789 Tech Road\nApt 5B\nAustin, TX 78701',
        taxNumber: 'US456789123',
        currency: 'USD',
        paymentTerms: 14,
        creditLimit: '10000.00',
        website: 'www.davidchen.dev',
        industry: 'Software Development',
        accountManager: 'Lisa Anderson',
        totalRevenue: '45000.00',
        outstandingBalance: '1000.00'
      },
      {
        name: 'Sophie Martin',
        company: 'Digital Marketing Pro',
        email: 'sophie@digitalmarketingpro.com',
        phone: '+1 (555) 456-7890',
        type: 'business',
        status: 'active',
        notes: 'Marketing agency, monthly retainer',
        lastProject: '2024-01-30',
        billingAddress: '321 Marketing Blvd\nSuite 200\nChicago, IL 60601',
        shippingAddress: '321 Marketing Blvd\nSuite 200\nChicago, IL 60601',
        taxNumber: 'US789123456',
        currency: 'USD',
        paymentTerms: 30,
        creditLimit: '35000.00',
        website: 'www.digitalmarketingpro.com',
        industry: 'Marketing',
        accountManager: 'Robert Taylor',
        totalRevenue: '95000.00',
        outstandingBalance: '3500.00'
      },
      {
        name: 'Alex Thompson',
        company: 'Startup Ventures Inc',
        email: 'alex@startupventures.co',
        phone: '+1 (555) 567-8901',
        type: 'business',
        status: 'active',
        notes: 'Startup client, rapid growth potential',
        lastProject: '2024-02-01',
        billingAddress: '567 Innovation Way\nSeattle, WA 98101',
        shippingAddress: '567 Innovation Way\nSeattle, WA 98101',
        taxNumber: 'US321654987',
        currency: 'USD',
        paymentTerms: 15,
        creditLimit: '20000.00',
        website: 'www.startupventures.co',
        industry: 'Technology',
        accountManager: 'Jennifer Lee',
        totalRevenue: '65000.00',
        outstandingBalance: '4500.00'
      }
    ];

    // Insert all clients
    await db.insert(clients).values(sampleClients);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error seeding clients:', error);
    return NextResponse.json({ error: 'Failed to seed clients' }, { status: 500 });
  }
} 