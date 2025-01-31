import { getInvoices } from '@/lib/db';
import { InvoicesTable } from './invoices-table';
import { InvoiceFilters } from './invoice-filters';
import type { PageProps } from 'next';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

type Props = PageProps<
  {},
  {
    status?: string;
    offset?: string;
  }
>;

export default async function InvoicesPage({ searchParams }: Props) {
  const searchParamsData = await Promise.resolve(searchParams);
  const offset = searchParamsData.offset ? Number(searchParamsData.offset) : 0;
  const status = searchParamsData.status as 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | undefined;

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
        <Link href="/test-invoice">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </Link>
      </div>
      <InvoiceFilters
        invoices={invoices}
        offset={offset}
        totalInvoices={totalInvoices}
      />
      <InvoicesTable
        invoices={invoices}
        offset={offset}
        totalInvoices={totalInvoices}
      />
    </div>
  );
} 