'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InvoicesTable } from './invoices-table';
import { useRouter, useSearchParams } from 'next/navigation';
import { SelectInvoice } from '@/lib/db';

export function InvoiceFilters({
  invoices,
  offset,
  totalInvoices
}: {
  invoices: SelectInvoice[];
  offset: number;
  totalInvoices: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get('status') ?? 'all';

  const statusValues = ['all', 'draft', 'sent', 'paid', 'overdue', 'cancelled'];
  
  return (
    <Tabs 
      defaultValue={currentStatus}
      onValueChange={(value) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === 'all') {
          params.delete('status');
        } else {
          params.set('status', value);
        }
        params.delete('offset'); // Reset pagination when changing filters
        router.push(`/invoices?${params.toString()}`);
      }}
    >
      <div className="flex items-center">
        <TabsList>
          {statusValues.map(status => (
            <TabsTrigger key={status} value={status} className="capitalize">
              {status}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <FileText className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Button>
          <Button size="sm" className="h-8 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              New Invoice
            </span>
          </Button>
        </div>
      </div>
      {statusValues.map(status => (
        <TabsContent key={status} value={status} className="mt-4">
          <InvoicesTable
            invoices={invoices}
            offset={offset}
            totalInvoices={totalInvoices}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
} 