'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StripeSyncStatus } from '@/components/StripeSyncStatus';
import { toast } from 'sonner';

interface Client {
  id: string;
  name: string;
  email: string;
  status: string;
  subscriptions: Array<{
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
  }>;
  createdAt: string;
  metadata: Record<string, any>;
}

const CLIENT_STATUSES = [
  'Active',
  'Inactive',
  'Pending',
  'Archived'
] as const;

export default function ClientPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date>();
  const [isEditing, setIsEditing] = useState(false);
  const [editedStatus, setEditedStatus] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const fetchClientDetails = async () => {
    try {
      const response = await fetch(`/api/clients/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch client details');
      }
      const data = await response.json();
      setClient(data);
      setEditedStatus(data.status);
      setLastSyncTime(new Date());
      setError(null);
    } catch (err) {
      setError('Failed to load client details');
      toast.error('Failed to load client details');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sign-in');
      return;
    }

    if (status === 'authenticated') {
      fetchClientDetails();
    }
  }, [status, params.id]);

  const handleSaveStatus = async () => {
    if (!client) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/clients/${client.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: editedStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update client status');
      }

      await fetchClientDetails();
      setIsEditing(false);
      toast.success('Client status updated successfully');
    } catch (err) {
      toast.error('Failed to update client status');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/clients/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete client');
      }

      toast.success('Client deleted successfully');
      router.push('/admin/clients');
      router.refresh();
    } catch (err) {
      toast.error('Failed to delete client');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600">Error</h2>
            <p className="mt-2">{error}</p>
            <Button
              onClick={() => router.push('/admin/clients')}
              className="mt-4"
              variant="outline"
            >
              Back to Clients
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold">Client Not Found</h2>
            <Button
              onClick={() => router.push('/admin/clients')}
              className="mt-4"
              variant="outline"
            >
              Back to Clients
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Client Details</h1>
          <div className="mt-2">
            <StripeSyncStatus
              onRefresh={fetchClientDetails}
              lastSyncTime={lastSyncTime}
            />
          </div>
        </div>
        <div className="space-x-2">
          <Button
            onClick={() => router.push('/admin/clients')}
            variant="outline"
          >
            Back
          </Button>
          {client.subscriptions.length === 0 && (
            <Button
              onClick={handleDelete}
              variant="destructive"
            >
              Delete Client
            </Button>
          )}
        </div>
      </div>

      <Card className="p-6">
        <div className="grid gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Client Information</h2>
            <div className="grid gap-4">
              <div>
                <span className="font-medium">Name:</span> {client.name}
              </div>
              <div>
                <span className="font-medium">Email:</span> {client.email}
              </div>
              <div>
                <span className="font-medium">Status:</span>{' '}
                {isEditing ? (
                  <div className="inline-flex items-center space-x-2">
                    <select
                      value={editedStatus}
                      onChange={(e) => setEditedStatus(e.target.value)}
                      className="ml-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      {CLIENT_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSaveStatus}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        setEditedStatus(client.status);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <Badge variant={client.status === 'Active' ? 'success' : 'secondary'}>
                      {client.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="ml-2"
                    >
                      Edit
                    </Button>
                  </>
                )}
              </div>
              <div>
                <span className="font-medium">Created:</span>{' '}
                {new Date(client.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {client.subscriptions.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Subscriptions</h2>
              <div className="space-y-4">
                {client.subscriptions.map((subscription) => (
                  <Card key={subscription.id} className="p-4">
                    <div className="grid gap-2">
                      <div>
                        <span className="font-medium">Plan:</span>{' '}
                        {subscription.plan.name}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>{' '}
                        <Badge
                          variant={
                            subscription.status === 'active'
                              ? 'success'
                              : 'default'
                          }
                        >
                          {subscription.status}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Amount:</span>{' '}
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: subscription.plan.currency,
                        }).format(subscription.plan.amount)}
                        /{subscription.plan.interval}
                      </div>
                      <div>
                        <span className="font-medium">Current Period:</span>{' '}
                        {new Date(
                          subscription.currentPeriodStart
                        ).toLocaleDateString()}{' '}
                        -{' '}
                        {new Date(
                          subscription.currentPeriodEnd
                        ).toLocaleDateString()}
                      </div>
                      <div className="mt-2">
                        <Button
                          onClick={() =>
                            router.push(
                              `/admin/subscriptions/${subscription.id}`
                            )
                          }
                          variant="outline"
                          size="sm"
                        >
                          Manage Subscription
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 