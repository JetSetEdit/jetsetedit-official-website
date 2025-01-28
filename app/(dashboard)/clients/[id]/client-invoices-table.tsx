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

export function ClientInvoicesTable({ invoices }: { invoices: SelectInvoice[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>
                <Link
                  href={`/invoices/${invoice.id}`}
                  className="font-medium hover:underline"
                >
                  {invoice.invoiceNumber}
                </Link>
              </TableCell>
              <TableCell>
                {new Date(invoice.issueDate).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {new Date(invoice.dueDate).toLocaleDateString()}
              </TableCell>
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
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No invoices found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
} 