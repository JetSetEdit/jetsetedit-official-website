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
import { deleteClient } from './actions';

export function Client({ client }: { client: SelectClient }) {
  return (
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
            <Button aria-haspopup="true" size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>
              <form action={deleteClient}>
                <input type="hidden" name="id" value={client.id} />
                <button type="submit" className="w-full text-left">Delete</button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
} 