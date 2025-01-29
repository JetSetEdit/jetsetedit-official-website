'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  taxRate: string | null;
  notes: string | null;
  terms: string | null;
  items: InvoiceItem[];
  subtotal: string | null;
  taxAmount: string | null;
  total: string | null;
  clientId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export function EditInvoiceForm({ invoice }: { invoice: Invoice }) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState(invoice.items);
  const [nextItemId, setNextItemId] = useState(-1);
  const [currentItem, setCurrentItem] = useState({
    description: '',
    quantity: 0,
    unitPrice: 0,
    amount: 0
  });

  const addItem = () => {
    if (!currentItem.description || currentItem.quantity <= 0 || currentItem.unitPrice <= 0) {
      toast({
        title: 'Error',
        description: 'Please fill in all item fields correctly.',
        variant: 'destructive',
      });
      return;
    }

    setItems([...items, {
      ...currentItem,
      id: nextItemId,
      amount: currentItem.quantity * currentItem.unitPrice
    }]);

    setNextItemId(nextItemId - 1);
    setCurrentItem({
      description: '',
      quantity: 0,
      unitPrice: 0,
      amount: 0
    });
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const data = {
        invoiceNumber: formData.get('invoiceNumber') as string,
        status: formData.get('status') as 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled',
        issueDate: formData.get('issueDate') as string,
        dueDate: formData.get('dueDate') as string,
        taxRate: Number(formData.get('taxRate')) || 0,
        notes: formData.get('notes') as string,
        terms: formData.get('terms') as string,
        items: items.map(({ id, ...item }) => item)
      };

      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update invoice');
      }

      toast({
        title: 'Success',
        description: 'Invoice has been updated.',
      });

      router.push(`/invoices/${invoice.id}`);
      router.refresh();
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update invoice',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Edit Invoice</h1>
      </div>

      <form onSubmit={onSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  name="invoiceNumber"
                  defaultValue={invoice.invoiceNumber}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={invoice.status}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  required
                  disabled={loading}
                  aria-label="Invoice status"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issueDate">Issue Date</Label>
                <Input
                  id="issueDate"
                  name="issueDate"
                  type="date"
                  defaultValue={invoice.issueDate}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  defaultValue={invoice.dueDate}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                name="taxRate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                defaultValue={invoice.taxRate || '0'}
                required
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={currentItem.description}
                  onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentItem.quantity}
                  onChange={(e) => setCurrentItem({ ...currentItem, quantity: Number(e.target.value) })}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>Unit Price</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentItem.unitPrice}
                  onChange={(e) => setCurrentItem({ ...currentItem, unitPrice: Number(e.target.value) })}
                  disabled={loading}
                />
              </div>
              <div className="pt-8">
                <Button
                  type="button"
                  onClick={addItem}
                  disabled={loading}
                >
                  Add Item
                </Button>
              </div>
            </div>

            <table className="w-full text-sm">
              <thead className="text-xs uppercase bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left">Description</th>
                  <th className="px-6 py-3 text-right">Quantity</th>
                  <th className="px-6 py-3 text-right">Unit Price</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="px-6 py-4">{item.description}</td>
                    <td className="px-6 py-4 text-right">{item.quantity}</td>
                    <td className="px-6 py-4 text-right">${item.unitPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">${item.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        disabled={loading}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={invoice.notes || ''}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="terms">Terms</Label>
              <Textarea
                id="terms"
                name="terms"
                defaultValue={invoice.terms || ''}
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            Update Invoice
          </Button>
        </div>
      </form>
    </div>
  );
} 