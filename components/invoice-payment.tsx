"use client";

import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { SelectInvoice } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';

interface InvoicePaymentProps {
  invoice: SelectInvoice;
  onSuccess?: () => void;
}

export function InvoicePayment({ invoice, onSuccess }: InvoicePaymentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Create a payment intent
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId: invoice.id,
          amount: Number(invoice.total) * 100, // Convert to cents
        }),
      });

      const { clientSecret } = await response.json();

      // Confirm the payment with the card element
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message || 'An error occurred');
      } else if (paymentIntent.status === 'succeeded') {
        // Update invoice status to paid
        await fetch(`/api/invoices/${invoice.id}/mark-paid`, {
          method: 'POST',
        });
        
        onSuccess?.();
      }
    } catch (err) {
      setError('An error occurred while processing your payment');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border p-4">
        <div className="mb-4">
          <h3 className="text-lg font-medium">Payment Details</h3>
          <p className="text-sm text-muted-foreground">
            Amount to pay: {formatCurrency(Number(invoice.total))}
          </p>
        </div>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#32325d',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#dc2626',
                iconColor: '#dc2626',
              },
            },
          }}
        />
      </div>
      {error && (
        <div className="text-sm text-red-500">{error}</div>
      )}
      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full"
      >
        {processing ? 'Processing...' : 'Pay Now'}
      </Button>
    </form>
  );
} 