import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { createApiResponse, handleApiError } from '@/lib/api/response';
import { verifyAdminRole } from '@/lib/middleware/adminAuth';

export async function POST(request: Request) {
  try {
    const session = await verifyAdminRole();
    if (session instanceof NextResponse) return session;

    const body = await request.json();
    const { subscriptionId, description } = body;

    if (!subscriptionId) {
      return createApiResponse({ error: 'Subscription ID is required' }, 400);
    }

    // Get the subscription to find the customer
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Create a draft invoice
    const invoice = await stripe.invoices.create({
      customer: subscription.customer as string,
      subscription: subscriptionId,
      description: description || 'Video editing services',
      auto_advance: false, // Draft invoice
      collection_method: 'send_invoice',
      days_until_due: 30,
    });

    // Add all pending usage to the invoice
    await stripe.invoices.finalizeInvoice(invoice.id);

    return createApiResponse({
      success: true,
      invoiceId: invoice.id,
      invoiceUrl: invoice.hosted_invoice_url,
    });

  } catch (error) {
    return handleApiError(error, 'Failed to create invoice');
  }
} 