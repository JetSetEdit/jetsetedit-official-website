'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Upload } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AddInvoiceDialogProps {
  clientId: string;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export function AddInvoiceDialog({ clientId }: AddInvoiceDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const { toast } = useToast();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  const [currentItem, setCurrentItem] = useState<InvoiceItem>({
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
      amount: currentItem.quantity * currentItem.unitPrice
    }]);

    setCurrentItem({
      description: '',
      quantity: 0,
      unitPrice: 0,
      amount: 0
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
      toast({
        title: 'Error',
        description: 'Please select a valid PDF file.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/extract-invoice', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to extract invoice data');
      }

      const data = await response.json();
      
      // Pre-fill the form with extracted data
      const form = event.target.closest('form');
      if (form) {
        // Set invoice number
        const invoiceNumberInput = form.querySelector('[name="invoiceNumber"]') as HTMLInputElement;
        if (invoiceNumberInput) invoiceNumberInput.value = data.invoiceNumber || '';

        // Set dates - ensure they are in YYYY-MM-DD format
        const issueDateInput = form.querySelector('[name="issueDate"]') as HTMLInputElement;
        if (issueDateInput && data.issueDate) {
          const date = new Date(data.issueDate);
          issueDateInput.value = date.toISOString().split('T')[0];
        }

        const dueDateInput = form.querySelector('[name="dueDate"]') as HTMLInputElement;
        if (dueDateInput && data.dueDate) {
          const date = new Date(data.dueDate);
          dueDateInput.value = date.toISOString().split('T')[0];
        }

        // Set tax rate
        const taxRateInput = form.querySelector('[name="taxRate"]') as HTMLInputElement;
        if (taxRateInput) taxRateInput.value = data.taxRate?.toString() || '10';

        // Set items
        if (Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items.map((item: any) => ({
            description: item.description || '',
            quantity: Number(item.quantity) || 0,
            unitPrice: Number(item.unitPrice) || 0,
            amount: Number(item.amount) || 0
          })));
        }

        // Set notes and terms
        const notesInput = form.querySelector('[name="notes"]') as HTMLTextAreaElement;
        if (notesInput) notesInput.value = data.notes || '';

        const termsInput = form.querySelector('[name="terms"]') as HTMLTextAreaElement;
        if (termsInput) termsInput.value = data.terms || '';

        // Set status to 'draft' by default for uploaded invoices
        const statusSelect = form.querySelector('[name="status"]') as HTMLSelectElement;
        if (statusSelect) statusSelect.value = 'draft';
      }

      toast({
        title: 'Success',
        description: 'Invoice data extracted successfully.',
      });
    } catch (error) {
      console.error('Error extracting invoice data:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to extract invoice data. Please fill in the form manually.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
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
        items
      };

      if (!data.invoiceNumber || !data.issueDate || !data.dueDate || items.length === 0) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields and add at least one item.',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch(`/api/clients/${clientId}/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create invoice');
      }

      toast({
        title: 'Success',
        description: 'Invoice has been created successfully.',
      });

      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create invoice. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Invoice
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Invoice</DialogTitle>
          <DialogDescription>
            Upload a PDF invoice or fill in the details manually.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* PDF Upload Section */}
          <Card className="border-dashed">
            <CardContent className="pt-4">
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="pdf-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">PDF files only</p>
                    </div>
                    <input
                      id="pdf-upload"
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                  </label>
                </div>
                {uploading && (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span className="text-sm text-muted-foreground">Extracting data...</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="invoiceNumber" className="text-right">
                Invoice Number *
              </Label>
              <Input
                id="invoiceNumber"
                name="invoiceNumber"
                className="col-span-3"
                required
                disabled={loading}
                placeholder="Enter invoice number"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status *
              </Label>
              <Select name="status" defaultValue="draft" required>
                <SelectTrigger className="col-span-3" disabled={loading}>
                  <SelectValue placeholder="Select invoice status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="issueDate" className="text-right">
                Issue Date *
              </Label>
              <Input
                id="issueDate"
                name="issueDate"
                type="date"
                className="col-span-3"
                required
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">
                Due Date *
              </Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                className="col-span-3"
                required
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="taxRate" className="text-right">
                Tax Rate (%)
              </Label>
              <Input
                id="taxRate"
                name="taxRate"
                type="number"
                step="0.01"
                className="col-span-3"
                disabled={loading}
                placeholder="Enter tax rate"
                defaultValue="10"
              />
            </div>

            {/* Line Items Section */}
            <div className="col-span-4 space-y-4">
              <h3 className="font-medium">Line Items</h3>
              
              {/* Current items */}
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">{item.description}</div>
                  <div className="col-span-2">{item.quantity}</div>
                  <div className="col-span-2">${item.unitPrice.toFixed(2)}</div>
                  <div className="col-span-2">${item.amount.toFixed(2)}</div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="col-span-1"
                    onClick={() => setItems(items.filter((_, i) => i !== index))}
                  >
                    ×
                  </Button>
                </div>
              ))}

              {/* Add new item form */}
              <div className="grid grid-cols-12 gap-2 items-center">
                <Input
                  className="col-span-5"
                  placeholder="Description"
                  value={currentItem.description}
                  onChange={(e) => setCurrentItem({
                    ...currentItem,
                    description: e.target.value
                  })}
                />
                <Input
                  className="col-span-2"
                  type="number"
                  step="1"
                  min="1"
                  placeholder="Qty"
                  value={currentItem.quantity || ''}
                  onChange={(e) => setCurrentItem({
                    ...currentItem,
                    quantity: Number(e.target.value)
                  })}
                />
                <Input
                  className="col-span-2"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Price"
                  value={currentItem.unitPrice || ''}
                  onChange={(e) => setCurrentItem({
                    ...currentItem,
                    unitPrice: Number(e.target.value)
                  })}
                />
                <div className="col-span-2">
                  ${(currentItem.quantity * currentItem.unitPrice).toFixed(2)}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="col-span-1"
                  onClick={addItem}
                >
                  +
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                name="notes"
                className="col-span-3"
                disabled={loading}
                placeholder="Add any additional notes"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="terms" className="text-right">
                Terms
              </Label>
              <Textarea
                id="terms"
                name="terms"
                className="col-span-3"
                disabled={loading}
                placeholder="Add payment terms"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="mr-2">Creating...</span>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </>
              ) : (
                'Create Invoice'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 