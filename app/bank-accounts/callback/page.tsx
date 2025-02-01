"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function BankAccountCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function handleCallback() {
      const connectionId = searchParams.get('connectionId');
      const userId = searchParams.get('userId');
      const status = searchParams.get('status');

      if (!connectionId || !userId) {
        console.error('Missing required parameters');
        router.push('/bank-accounts?error=missing_params');
        return;
      }

      try {
        // Update the connection status in our database
        const response = await fetch('/api/bank-accounts/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            connectionId,
            userId,
            status
          })
        });

        if (!response.ok) {
          throw new Error('Failed to update connection status');
        }

        // Redirect back to bank accounts page
        router.push('/bank-accounts?success=true');
      } catch (error) {
        console.error('Callback error:', error);
        router.push('/bank-accounts?error=callback_failed');
      }
    }

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="container max-w-md py-8">
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <h2 className="text-lg font-semibold">Finalizing Connection</h2>
          <p className="text-sm text-muted-foreground text-center">
            Please wait while we finish setting up your bank connection...
          </p>
        </div>
      </Card>
    </div>
  );
} 