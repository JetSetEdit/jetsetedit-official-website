'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import HourlyBillingManager from '@/components/HourlyBillingManager';

export default function AdminBillingPage() {
  const { data: session, status } = useSession();
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/subscriptions/active');
        if (!response.ok) {
          throw new Error('Failed to fetch subscription');
        }
        const data = await response.json();
        setSubscriptionId(data.subscriptionId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load subscription');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchSubscription();
    }
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500">Please sign in to access billing</p>
          <button
            onClick={() => window.location.href = '/auth/signin'}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Billing Management</h1>
      {subscriptionId ? (
        <HourlyBillingManager subscriptionId={subscriptionId} />
      ) : (
        <div className="text-center text-gray-500">
          <p>No active subscription found.</p>
        </div>
      )}
    </div>
  );
} 