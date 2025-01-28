import { getInvoices } from '@/lib/db';
import { InvoicesTable } from './invoices-table';
import { InvoiceFilters } from './invoice-filters';

export default async function InvoicesPage({
  searchParams
}: {
  searchParams: { status?: string; offset?: string };
}) {
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