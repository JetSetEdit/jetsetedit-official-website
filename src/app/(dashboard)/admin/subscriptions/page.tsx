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

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        console.log('Fetching subscriptions...', { 
          sessionStatus: status, 
          hasSession: !!session,
          sessionDetails: session 
        });

        const response = await fetch('/api/subscriptions');
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        const contentType = response.headers.get('content-type');
        console.log('Response content type:', contentType);
        
        const text = await response.text();
        console.log('Raw response:', text);
        
        if (!response.ok) {
          let errorMessage = 'Failed to fetch subscriptions';
          try {
            const errorData = JSON.parse(text);
            errorMessage = errorData.error || errorMessage;
            console.error('Error details:', errorData);
          } catch (e) {
            console.error('Failed to parse error response:', e);
          }
          throw new Error(errorMessage);
        }
        
        let data;
        try {
          data = JSON.parse(text);
          console.log('Parsed subscriptions data:', data);
          if (Array.isArray(data)) {
            console.log(`Found ${data.length} subscriptions in response`);
            if (data.length > 0) {
              console.log('Sample subscription:', data[0]);
            } else {
              console.log('No subscriptions found in response');
            }
          } else {
            console.error('Response is not an array:', data);
          }
        } catch (e) {
          console.error('Failed to parse subscriptions response:', e);
          throw new Error('Invalid response format');
        }
        
        setSubscriptions(data);
      } catch (err) {
        console.error('Error in fetchSubscriptions:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      console.log('Session is authenticated, fetching subscriptions...');
      fetchSubscriptions();
    } else if (status === 'unauthenticated') {
      console.log('Session is unauthenticated');
      setError('Please sign in to view subscriptions');
      setLoading(false);
    }
  }, [status, session]);

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
          <h1 className="text-2xl font-bold">Subscriptions</h1>
          <button
            onClick={() => window.location.href = '/admin/subscriptions/new'}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Subscription
          </button>
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
                    <button
                      onClick={() => window.location.href = `/admin/subscriptions/${subscription.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Manage
                    </button>
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