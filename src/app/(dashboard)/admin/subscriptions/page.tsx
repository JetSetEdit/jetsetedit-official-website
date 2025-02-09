'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StripeSyncStatus } from '@/components/StripeSyncStatus';
import { toast } from 'sonner';
import { format } from 'date-fns';

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

export default function SubscriptionsPage() {
  const { data: session, status } = useSession();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date>();

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/subscriptions');
      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions');
      }
      const data = await response.json();
      setSubscriptions(data);
      setLastSyncTime(new Date());
    } catch (err) {
      console.error('Error in fetchSubscriptions:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err; // Re-throw to be caught by the sync status component
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSubscriptions();
    }
  }, [status]);

  const handleDelete = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) {
      return;
    }

    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      toast.success('Subscription cancelled successfully');
      // Refresh the subscriptions list
      fetchSubscriptions();
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      toast.error('Failed to cancel subscription');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto py-10">
        <Card className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading subscriptions...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Card className="p-6">
          <div className="text-center text-red-500">
            <p>{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Subscriptions</h1>
            <div className="mt-2">
              <StripeSyncStatus
                onRefresh={fetchSubscriptions}
                lastSyncTime={lastSyncTime}
              />
            </div>
          </div>
          <Button
            onClick={() => window.location.href = '/admin/subscriptions/new'}
          >
            Create Subscription
          </Button>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Current Period</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{subscription.customerName}</div>
                      <div className="text-sm text-gray-500">{subscription.customerEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>{subscription.plan.name}</TableCell>
                  <TableCell>
                    <Badge variant={
                      subscription.status === 'active' ? 'success' :
                      subscription.status === 'trialing' ? 'warning' :
                      subscription.status === 'past_due' ? 'destructive' : 'secondary'
                    }>
                      {subscription.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: subscription.plan.currency.toUpperCase(),
                    }).format(subscription.plan.amount)}
                    /{subscription.plan.interval}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {format(new Date(subscription.currentPeriodStart), 'MMM d, yyyy')} -{' '}
                      {format(new Date(subscription.currentPeriodEnd), 'MMM d, yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => window.location.href = `/admin/subscriptions/${subscription.id}`}
                        className="text-sm"
                      >
                        Manage
                      </Button>
                      {subscription.status === 'active' && (
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(subscription.id)}
                          className="text-sm"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {subscriptions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    No subscriptions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
} 