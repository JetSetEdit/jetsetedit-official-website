'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface Client {
  id: string;
  name: string;
  email: string;
  status: string;
  subscriptionStatus: string;
  currentPeriodEnd: string | null;
  createdAt: string;
  metadata: Record<string, string>;
}

interface Subscription {
  id: string;
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

export default function ClientDetailPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    if (status === 'authenticated' && params.id) {
      fetchClientData();
    }
  }, [status, params.id]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      
      // Fetch client details
      const clientResponse = await fetch(`/api/clients/${params.id}`);
      if (!clientResponse.ok) {
        throw new Error('Failed to fetch client details');
      }
      const clientData = await clientResponse.json();
      setClient(clientData);
      setFormData({
        name: clientData.name,
        email: clientData.email,
      });

      // Fetch client's subscriptions
      const subscriptionsResponse = await fetch(`/api/subscriptions?customerId=${params.id}`);
      if (!subscriptionsResponse.ok) {
        throw new Error('Failed to fetch subscriptions');
      }
      const subscriptionsData = await subscriptionsResponse.json();
      setSubscriptions(subscriptionsData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load client data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch('/api/clients', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: params.id,
          ...formData,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update client');
      }

      await fetchClientData();
      setShowEditForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update client');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubscription = () => {
    window.location.href = `/admin/subscriptions/new?clientId=${params.id}`;
  };

  const handleManageSubscription = (subscriptionId: string) => {
    window.location.href = `/admin/subscriptions/${subscriptionId}`;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto py-10">
        <Card className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading client details...</p>
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

  if (!client) {
    return (
      <div className="container mx-auto py-10">
        <Card className="p-6">
          <div className="text-center text-gray-500">
            <p>Client not found</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Client Details</h1>
        <div className="space-x-4">
          <button
            onClick={() => setShowEditForm(!showEditForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {showEditForm ? 'Cancel' : 'Edit Client'}
          </button>
          <button
            onClick={() => window.location.href = '/admin/clients'}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Back to Clients
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Client Information</h2>
          
          {showEditForm ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{client.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{client.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge variant={client.status === 'Active' ? 'success' : 'secondary'}>
                  {client.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">{format(new Date(client.createdAt), 'MMM d, yyyy')}</p>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Subscriptions</h2>
            <button
              onClick={handleCreateSubscription}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Add Subscription
            </button>
          </div>

          <div className="space-y-4">
            {subscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{subscription.plan.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: subscription.plan.currency.toUpperCase(),
                      }).format(subscription.plan.amount)}/{subscription.plan.interval}
                    </p>
                  </div>
                  <Badge variant={
                    subscription.status === 'active' ? 'success' :
                    subscription.status === 'trialing' ? 'warning' : 'secondary'
                  }>
                    {subscription.status}
                  </Badge>
                </div>

                <div className="text-sm text-gray-500">
                  <p>Current Period: {format(new Date(subscription.currentPeriodStart), 'MMM d, yyyy')} - {format(new Date(subscription.currentPeriodEnd), 'MMM d, yyyy')}</p>
                </div>

                <button
                  onClick={() => handleManageSubscription(subscription.id)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Manage Subscription
                </button>
              </div>
            ))}

            {subscriptions.length === 0 && (
              <div className="text-center text-gray-500">
                <p>No active subscriptions</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
} 