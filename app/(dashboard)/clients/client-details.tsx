'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { SelectClient } from '@/lib/db';
import { Badge } from '@/components/ui/badge';

export function ClientDetails({
  client,
  open,
  onOpenChange
}: {
  client: SelectClient;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{client.name}</DialogTitle>
          <DialogDescription>Client Details</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Basic Information</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><span className="font-medium">Company:</span> {client.company || '-'}</p>
                <p><span className="font-medium">Website:</span> {client.website || '-'}</p>
                <p><span className="font-medium">Industry:</span> {client.industry || '-'}</p>
                <p><span className="font-medium">Account Manager:</span> {client.accountManager || '-'}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Contact Information</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><span className="font-medium">Email:</span> {client.email}</p>
                <p><span className="font-medium">Phone:</span> {client.phone || '-'}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Status</h4>
              <div className="flex gap-2">
                <Badge variant="outline" className="capitalize">
                  {client.type}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {client.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Financial Details</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium">Total Revenue:</span>{' '}
                  {client.totalRevenue ? new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: client.currency || 'USD'
                  }).format(Number(client.totalRevenue)) : '-'}
                </p>
                <p>
                  <span className="font-medium">Outstanding Balance:</span>{' '}
                  {client.outstandingBalance ? new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: client.currency || 'USD'
                  }).format(Number(client.outstandingBalance)) : '-'}
                </p>
                <p><span className="font-medium">Payment Terms:</span> Net {client.paymentTerms || 30}</p>
                <p>
                  <span className="font-medium">Credit Limit:</span>{' '}
                  {client.creditLimit ? new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: client.currency || 'USD'
                  }).format(Number(client.creditLimit)) : '-'}
                </p>
                <p><span className="font-medium">Tax Number:</span> {client.taxNumber || '-'}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Addresses</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>
                  <p className="font-medium">Billing Address:</p>
                  <p className="whitespace-pre-line">{client.billingAddress || '-'}</p>
                </div>
                <div>
                  <p className="font-medium">Shipping Address:</p>
                  <p className="whitespace-pre-line">{client.shippingAddress || '-'}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Important Dates</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium">Last Project:</span>{' '}
                  {client.lastProject ? new Date(client.lastProject).toLocaleDateString("en-US") : '-'}
                </p>
                <p>
                  <span className="font-medium">Last Invoice:</span>{' '}
                  {client.lastInvoiceDate ? new Date(client.lastInvoiceDate).toLocaleDateString("en-US") : '-'}
                </p>
                <p>
                  <span className="font-medium">Client Since:</span>{' '}
                  {new Date(client.createdAt).toLocaleDateString("en-US")}
                </p>
              </div>
            </div>
          </div>

          {/* Notes Section - Full Width */}
          {client.notes && (
            <div className="col-span-full">
              <h4 className="font-medium mb-2">Notes</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {client.notes}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 