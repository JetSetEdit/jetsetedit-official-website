import { getInvoices } from '@/lib/db';
import { InvoicesTable } from './invoices-table';
import { InvoiceFilters } from './invoice-filters';
import type { PageProps } from 'next';

type Props = PageProps<
  {},
  {
    status?: string;
    offset?: string;
  }
>;

export default async function InvoicesPage({ searchParams }: Props) {
  const offset = searchParams.offset ? Number(searchParams.offset) : 0;
  const status = searchParams.status as 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | undefined;

  const { invoices, newOffset, totalInvoices } = await getInvoices(
    undefined,
    status,
    offset
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage invoices for your clients.
          </p>
        </div>
      </div>
      <InvoiceFilters
        invoices={invoices}
        offset={offset}
        totalInvoices={totalInvoices}
      />
    </div>
  );
} 