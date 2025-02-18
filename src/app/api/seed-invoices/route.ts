import { db, clients, invoices, invoiceItems, invoicePayments } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // First, get some clients to associate invoices with
    const existingClients = await db.select().from(clients).limit(3);
    
    if (existingClients.length === 0) {
      return NextResponse.json({ error: 'Please seed clients first' });
    }

    // Create sample invoices for each client
    for (const client of existingClients) {
      // Create a paid invoice
      const paidInvoice = await db.insert(invoices).values({
        clientId: client.id,
        invoiceNumber: `INV-${Date.now()}-1`,
        status: 'paid',
        issueDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        subtotal: '1000.00',
        taxRate: '10.00',
        taxAmount: '100.00',
        total: '1100.00',
        notes: 'Thank you for your business!',
        terms: 'Net 30'
      }).returning();

      // Add items to the paid invoice
      await db.insert(invoiceItems).values([
        {
          invoiceId: paidInvoice[0].id,
          description: 'Web Development Services',
          quantity: '10',
          unitPrice: '75.00',
          amount: '750.00'
        },
        {
          invoiceId: paidInvoice[0].id,
          description: 'UI/UX Design',
          quantity: '5',
          unitPrice: '50.00',
          amount: '250.00'
        }
      ]);

      // Add payment for the paid invoice
      await db.insert(invoicePayments).values({
        invoiceId: paidInvoice[0].id,
        amount: '1100.00',
        paymentDate: new Date().toISOString(),
        paymentMethod: 'bank_transfer',
        reference: 'TRX123456',
        notes: 'Payment received in full'
      });

      // Create an overdue invoice
      const overdueInvoice = await db.insert(invoices).values({
        clientId: client.id,
        invoiceNumber: `INV-${Date.now()}-2`,
        status: 'overdue',
        issueDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
        dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
        subtotal: '2000.00',
        taxRate: '10.00',
        taxAmount: '200.00',
        total: '2200.00',
        notes: 'Payment overdue. Please pay immediately.',
        terms: 'Net 30'
      }).returning();

      // Add items to the overdue invoice
      await db.insert(invoiceItems).values([
        {
          invoiceId: overdueInvoice[0].id,
          description: 'Website Maintenance',
          quantity: '1',
          unitPrice: '1500.00',
          amount: '1500.00'
        },
        {
          invoiceId: overdueInvoice[0].id,
          description: 'SEO Services',
          quantity: '1',
          unitPrice: '500.00',
          amount: '500.00'
        }
      ]);

      // Create a draft invoice
      const draftInvoice = await db.insert(invoices).values({
        clientId: client.id,
        invoiceNumber: `INV-${Date.now()}-3`,
        status: 'draft',
        issueDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        subtotal: '500.00',
        taxRate: '10.00',
        taxAmount: '50.00',
        total: '550.00',
        notes: 'Draft invoice for review',
        terms: 'Net 30'
      }).returning();

      // Add items to the draft invoice
      await db.insert(invoiceItems).values({
        invoiceId: draftInvoice[0].id,
        description: 'Consulting Services',
        quantity: '5',
        unitPrice: '100.00',
        amount: '500.00'
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error seeding invoices:', error);
    return NextResponse.json({ error: 'Failed to seed invoices' }, { status: 500 });
  }
} 