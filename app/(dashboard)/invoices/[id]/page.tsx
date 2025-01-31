import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { invoices, invoiceItems, clients } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatDate, formatCurrency } from '@/lib/utils';
import { UpdateStatus } from './update-status';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Edit } from 'lucide-react';
import { PaymentSection } from './payment-section';

interface Props {
  params: {
    id: string;
  };
}

async function getInvoiceById(id: number) {
  const [result] = await db
    .select({
      invoice: invoices,
      client: clients
    })
    .from(invoices)
    .where(eq(invoices.id, id))
    .leftJoin(clients, eq(invoices.clientId, clients.id));

  if (!result) return null;

  const items = await db
    .select()
    .from(invoiceItems)
    .where(eq(invoiceItems.invoiceId, id));

  return {
    ...result,
    items
  };
}

export default async function InvoicePage({ params }: Props) {
  const id = await Promise.resolve(params.id);
  const invoiceData = await getInvoiceById(Number(id));

  if (!invoiceData) {
    notFound();
  }

  const { invoice, client, items } = invoiceData;

  const statusColors = {
    draft: 'secondary',
    sent: 'default',
    paid: 'secondary',
    overdue: 'destructive',
    cancelled: 'outline'
  } as const;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoice #{invoice.invoiceNumber}</h1>
          <p className="text-sm text-muted-foreground">
            Created on {new Date(invoice.createdAt).toLocaleDateString('en-AU')}
          </p>
        </div>
        <Badge 
          variant={invoice.status === 'paid' ? 'default' : 'secondary'}
          className="capitalize"
        >
          {invoice.status}
        </Badge>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
            <CardDescription>Details of the invoice and payment status.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-2">
              <div className="text-sm font-medium">Amount Due</div>
              <div className="text-2xl font-bold">{formatCurrency(Number(invoice.total))}</div>
            </div>
            <div className="grid gap-2">
              <div className="text-sm font-medium">Due Date</div>
              <div>{new Date(invoice.dueDate).toLocaleDateString('en-AU')}</div>
            </div>
            {invoice.notes && (
              <div className="grid gap-2">
                <div className="text-sm font-medium">Notes</div>
                <div className="text-sm text-muted-foreground">{invoice.notes}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {invoice.status !== 'paid' && <PaymentSection invoice={invoice} />}

        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
            <CardDescription>Items included in this invoice.</CardDescription>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 text-left font-medium">Description</th>
                  <th className="pb-2 text-right font-medium">Quantity</th>
                  <th className="pb-2 text-right font-medium">Unit Price</th>
                  <th className="pb-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2">{item.description}</td>
                    <td className="py-2 text-right">{Number(item.quantity)}</td>
                    <td className="py-2 text-right">{formatCurrency(Number(item.unitPrice))}</td>
                    <td className="py-2 text-right">{formatCurrency(Number(item.amount))}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={3} className="pt-4 text-right font-medium">Subtotal</td>
                  <td className="pt-4 text-right">{formatCurrency(Number(invoice.subtotal))}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="pt-2 text-right font-medium">Tax ({Number(invoice.taxRate) * 100}%)</td>
                  <td className="pt-2 text-right">{formatCurrency(Number(invoice.taxAmount))}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="pt-2 text-right font-bold">Total</td>
                  <td className="pt-2 text-right font-bold">{formatCurrency(Number(invoice.total))}</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 