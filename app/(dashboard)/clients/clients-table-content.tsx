'use client';

import {
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Table
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { SelectClient } from '@/lib/db';

export function ClientsTableContent({ clients }: { clients: SelectClient[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <TableRow key={client.id} className="cursor-pointer hover:bg-muted/50">
            <TableCell>
              <Link 
                href={`/clients/${client.id}`}
                className="block font-medium hover:underline"
              >
                {client.name}
              </Link>
            </TableCell>
            <TableCell>{client.email}</TableCell>
            <TableCell>{client.company || 'N/A'}</TableCell>
            <TableCell>
              <Badge variant="outline" className="capitalize">
                {client.type}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge
                variant={client.status === 'active' ? 'default' : 'secondary'}
                className="capitalize"
              >
                {client.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
        {clients.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={5}
              className="h-24 text-center text-muted-foreground"
            >
              No clients found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
} 