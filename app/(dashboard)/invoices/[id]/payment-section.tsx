'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { InvoicePayment } from '@/components/invoice-payment';
import { revalidatePath } from 'next/cache';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentSectionProps {
  invoice: any;
}

export function PaymentSection({ invoice }: PaymentSectionProps) {
  const handlePaymentSuccess = () => {
    revalidatePath(`/invoices/${invoice.id}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment</CardTitle>
        <CardDescription>Pay this invoice using your credit card.</CardDescription>
      </CardHeader>
      <CardContent>
        <Elements stripe={stripePromise}>
          <InvoicePayment 
            invoice={invoice} 
            onSuccess={handlePaymentSuccess}
          />
        </Elements>
      </CardContent>
    </Card>
  );
} 