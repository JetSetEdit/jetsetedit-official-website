'use client';

import {
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Table
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Client } from './client';
import { SelectClient } from '@/lib/db';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from './empty-state';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ClientsTableContent } from './clients-table-content';

export function ClientsTable({
  clients,
  offset,
  totalClients
}: {
  clients: SelectClient[];
  offset: number;
  totalClients: number;
}) {
  if (clients.length === 0) {
    return <EmptyState />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clients</CardTitle>
        <CardDescription>
          Manage your clients and view their project history.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ClientsTableContent clients={clients} />
      </CardContent>
      <CardFooter>
        <div className="flex items-center w-full justify-between">
          <div className="text-xs text-muted-foreground">
            Showing{' '}
            <strong>
              {offset + 1}-{Math.min(offset + clients.length, totalClients)}
            </strong>{' '}
            of <strong>{totalClients}</strong> clients
          </div>
          <div className="flex">
            <Button
              variant="ghost"
              size="sm"
              disabled={offset <= 0}
              onClick={() => {
                const searchParams = new URLSearchParams(window.location.search);
                searchParams.set('offset', Math.max(0, offset - 10).toString());
                window.location.search = searchParams.toString();
              }}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Prev
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={offset + clients.length >= totalClients}
              onClick={() => {
                const searchParams = new URLSearchParams(window.location.search);
                searchParams.set('offset', (offset + 10).toString());
                window.location.search = searchParams.toString();
              }}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
} 