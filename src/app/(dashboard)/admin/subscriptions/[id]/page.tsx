'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Subscription {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  plan: {
    id: string;
    name: string;
    amount: number;
    currency: string;
    interval: string;
  };
}

export default function SubscriptionDetailPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchSubscription();
  }, [session, status]);

  const fetchSubscription = async () => {
    try {
      const response = await fetch(`/api/subscriptions/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }
      const data = await response.json();
      setSubscription(data);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this subscription?')) {
      return;
    }

    setCancelling(true);
    try {
      const response = await fetch(`/api/subscriptions/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      toast.success('Subscription cancelled successfully');
      router.push('/admin/subscriptions');
    } catch (err) {
      toast.error('Failed to cancel subscription');
    } finally {
      setCancelling(false);
    }
  };

  const handleUpdatePayment = () => {
    // Implement Stripe Customer Portal redirect
    toast.info('Payment method update will be implemented soon');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p>{error}</p>
        </Card>
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Subscription Details</h1>
        <p className="text-gray-600">Manage subscription information and settings</p>
      </div>

      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {subscription.customerName}</p>
              <p><span className="font-medium">Email:</span> {subscription.customerEmail}</p>
              <p><span className="font-medium">Customer ID:</span> {subscription.customerId}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Subscription Status</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Status: </span>
                <Badge variant={subscription.status === 'active' ? 'success' : 'warning'}>
                  {subscription.status}
                </Badge>
              </p>
              <p>
                <span className="font-medium">Current Period:</span>
                <br />
                {new Date(subscription.currentPeriodStart).toLocaleDateString()} - 
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Plan Details</h2>
        <div className="space-y-2">
          <p><span className="font-medium">Plan:</span> {subscription.plan.name}</p>
          <p>
            <span className="font-medium">Price:</span> 
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: subscription.plan.currency
            }).format(subscription.plan.amount)}
            /{subscription.plan.interval}
          </p>
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          variant="outline"
          onClick={handleUpdatePayment}
          className="flex-1"
        >
          Update Payment Method
        </Button>
        <Button
          variant="destructive"
          onClick={handleCancel}
          disabled={cancelling || subscription.status !== 'active'}
          className="flex-1"
        >
          {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
        </Button>
      </div>
    </div>
  );
} 