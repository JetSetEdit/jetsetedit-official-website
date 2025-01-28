'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { SelectClient } from '@/lib/db';
import { useState } from 'react';
import { ClientDetails } from './client-details';
import { EditClient } from './edit-client';
import { DeleteClient } from './delete-client';

export function Client({ client }: { client: SelectClient }) {
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">{client.name}</TableCell>
        <TableCell>{client.company || '-'}</TableCell>
        <TableCell>
          <Badge variant="outline" className="capitalize">
            {client.type}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className="capitalize">
            {client.status}
          </Badge>
        </TableCell>
        <TableCell className="hidden md:table-cell">{client.email}</TableCell>
        <TableCell className="hidden md:table-cell">{client.phone || '-'}</TableCell>
        <TableCell className="hidden md:table-cell">
          {client.lastProject ? new Date(client.lastProject).toLocaleDateString("en-US") : '-'}
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-label="Open menu" size="icon" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => setShowDetails(true)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setShowEdit(true)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onSelect={() => setShowDelete(true)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <ClientDetails
        client={client}
        open={showDetails}
        onOpenChange={setShowDetails}
      />

      <EditClient
        client={client}
        open={showEdit}
        onOpenChange={setShowEdit}
      />

      <DeleteClient
        client={client}
        open={showDelete}
        onOpenChange={setShowDelete}
      />
    </>
  );
} 