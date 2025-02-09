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

interface Client {
  id: string;
  name: string;
  email: string;
  status: string;
  subscriptionStatus: string;
  currentPeriodEnd: string | null;
  createdAt: string;
}

export default function ClientsPage() {
  const { data: session, status } = useSession();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('/api/clients');
        if (!response.ok) {
          throw new Error('Failed to fetch clients');
        }
        const data = await response.json();
        setClients(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load clients');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchClients();
    }
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto py-10">
        <Card className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading clients...</p>
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
          <h1 className="text-2xl font-bold">Clients</h1>
          <button
            onClick={() => window.location.href = '/admin/clients/new'}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add New Client
          </button>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Current Period End</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>
                    <Badge variant={client.status === 'Active' ? 'success' : 'secondary'}>
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      client.subscriptionStatus === 'active' ? 'success' :
                      client.subscriptionStatus === 'trialing' ? 'warning' : 'secondary'
                    }>
                      {client.subscriptionStatus || 'No subscription'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {client.currentPeriodEnd 
                      ? format(new Date(client.currentPeriodEnd), 'MMM d, yyyy')
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {format(new Date(client.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                </TableRow>
              ))}
              {clients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    No clients found
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