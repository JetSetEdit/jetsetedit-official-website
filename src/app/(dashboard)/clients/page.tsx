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
  const { data: session, status: sessionStatus } = useSession();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        console.log('Fetching clients...', { 
          sessionStatus, 
          hasSession: !!session,
          sessionDetails: session 
        });

        const response = await fetch('/api/clients');
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        const contentType = response.headers.get('content-type');
        console.log('Response content type:', contentType);
        
        const text = await response.text();
        console.log('Raw response:', text);
        
        if (!response.ok) {
          let errorMessage = 'Failed to fetch clients';
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
          console.log('Parsed clients data:', data);
          if (Array.isArray(data)) {
            console.log(`Found ${data.length} clients in response`);
            if (data.length > 0) {
              console.log('Sample client:', data[0]);
            } else {
              console.log('No clients found in response');
            }
          } else {
            console.error('Response is not an array:', data);
          }
        } catch (e) {
          console.error('Failed to parse clients response:', e);
          throw new Error('Invalid response format');
        }
        
        setClients(data);
      } catch (err) {
        console.error('Error in fetchClients:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (sessionStatus === 'authenticated') {
      console.log('Session is authenticated, fetching clients...');
      fetchClients();
    } else if (sessionStatus === 'unauthenticated') {
      console.log('Session is unauthenticated');
      setError('Please sign in to view clients');
      setLoading(false);
    }
  }, [sessionStatus, session]);

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="container mx-auto py-10">
        <Card className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <div>{sessionStatus === 'loading' ? 'Loading session...' : 'Loading clients...'}</div>
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
            <p className="font-bold">Error:</p>
            <p>{error}</p>
            {sessionStatus === 'unauthenticated' && (
              <button
                onClick={() => window.location.href = '/auth/signin'}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Sign In
              </button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="p-6">
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
                    No clients found. If you have clients in Stripe, please check the console for any errors.
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