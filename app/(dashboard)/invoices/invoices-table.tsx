import { SelectInvoice } from '@/lib/db';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { InvoicesTableContent } from './invoices-table-content';

export function InvoicesTable({
  invoices,
  offset,
  totalInvoices
}: {
  invoices: SelectInvoice[];
  offset: number;
  totalInvoices: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
        <CardDescription>
          View and manage your invoices.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <InvoicesTableContent invoices={invoices} />
      </CardContent>
      <CardFooter>
        <div className="flex items-center w-full justify-between">
          <div className="text-xs text-muted-foreground">
            Showing{' '}
            <strong>
              {offset + 1}-{Math.min(offset + invoices.length, totalInvoices)}
            </strong>{' '}
            of <strong>{totalInvoices}</strong> invoices
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
              disabled={offset + invoices.length >= totalInvoices}
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