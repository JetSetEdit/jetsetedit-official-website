'use client';

import { SelectInvoice } from '@/lib/db';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

function formatDate(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString('en-AU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function InvoicesTableContent({ invoices }: { invoices: SelectInvoice[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice #</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Issue Date</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id} className="cursor-pointer hover:bg-muted/50">
            <TableCell>
              <Link
                href={`/invoices/${invoice.id}`}
                className="font-medium hover:underline"
              >
                {invoice.invoiceNumber}
              </Link>
            </TableCell>
            <TableCell>{invoice.clientId}</TableCell>
            <TableCell>{formatDate(invoice.issueDate)}</TableCell>
            <TableCell>{formatDate(invoice.dueDate)}</TableCell>
            <TableCell>
              <Badge
                variant={
                  invoice.status === 'paid'
                    ? 'default'
                    : invoice.status === 'overdue'
                    ? 'destructive'
                    : 'secondary'
                }
                className="capitalize"
              >
                {invoice.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              {formatCurrency(Number(invoice.total))}
            </TableCell>
          </TableRow>
        ))}
        {invoices.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={6}
              className="h-24 text-center text-muted-foreground"
            >
              No invoices found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
} 