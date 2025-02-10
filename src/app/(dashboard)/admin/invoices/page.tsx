'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StripeSyncStatus } from '@/components/StripeSyncStatus';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Switch } from '@/components/ui/switch';

interface Invoice {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  status: string;
  dueDate: string | null;
  paidAt: string | null;
  createdAt: string;
  hostedUrl: string | null;
  pdfUrl: string | null;
  description: string | null;
  subscription: {
    id: string;
    status: string;
  } | null;
}

interface CreditNote {
  id: string;
  amount: number;
  reason: string;
  description: string;
  created: number;
}

interface ActionDropdownProps {
  invoice: Invoice;
  onAction: (action: string) => void;
  position?: 'left' | 'right';
}

function ActionDropdown({ invoice, onAction, position = 'right' }: ActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getAvailableActions = () => {
    const actions = [];

    if (invoice.status === 'draft') {
      actions.push({ key: 'edit', label: 'Edit' });
      actions.push({ key: 'finalize', label: 'Finalize' });
    }

    if (invoice.status === 'open') {
      actions.push({ key: 'pay', label: 'Mark Paid' });
      actions.push({ key: 'send', label: 'Send' });
    }

    if (invoice.status !== 'void' && invoice.status !== 'draft') {
      actions.push({ key: 'credit', label: 'Credit Note' });
    }

    if (invoice.status !== 'void') {
      actions.push({ key: 'recreate', label: 'Void & Recreate' });
    }

    if (invoice.hostedUrl) {
      actions.push({ key: 'view', label: 'View' });
    }

    if (invoice.pdfUrl) {
      actions.push({ key: 'pdf', label: 'Download PDF' });
    }

    if (invoice.status !== 'void' && invoice.status !== 'uncollectible') {
      actions.push({ key: 'archive', label: 'Archive' });
    }

    return actions;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 focus:outline-none"
      >
        Actions
        <svg
          className="w-4 h-4 ml-1 inline-block"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`absolute z-20 mt-2 ${position === 'right' ? 'right-0' : 'left-0'} w-48 bg-white rounded-md shadow-lg py-1 border`}
          >
            {getAvailableActions().map(({ key, label }) => (
              <button
                key={key}
                onClick={() => {
                  onAction(key);
                  setIsOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function InvoicesPage() {
  const { data: session, status } = useSession();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date>();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [showCreditNoteModal, setShowCreditNoteModal] = useState(false);
  const [showRecreateModal, setShowRecreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showOnlyActiveClients, setShowOnlyActiveClients] = useState(true);
  const [activeClientIds, setActiveClientIds] = useState<Set<string>>(new Set());

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices');
      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }
      const data = await response.json();
      setInvoices(data);
      setLastSyncTime(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (!response.ok) throw new Error('Failed to fetch clients');
      const clients = await response.json();
      const activeIds = new Set(
        clients
          .filter(client => client.status === 'Active')
          .map(client => client.id)
      );
      setActiveClientIds(activeIds);
    } catch (err) {
      console.error('Error fetching active clients:', err);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchInvoices();
      fetchActiveClients();
    }
  }, [status]);

  const handleCreateInvoice = () => {
    // Implementation remains the same
  };

  const handleViewInvoice = (hostedUrl: string) => {
    window.open(hostedUrl, '_blank');
  };

  const handleDownloadPDF = (pdfUrl: string) => {
    window.open(pdfUrl, '_blank');
  };

  const handleCreateCreditNote = async (invoiceId: string, amount: number, reason: string, description: string) => {
    try {
      const response = await fetch('/api/invoices/credit-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId,
          amount,
          reason,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create credit note');
      }

      toast.success('Credit note created successfully');
      setShowCreditNoteModal(false);
      fetchInvoices();
    } catch (err) {
      toast.error('Failed to create credit note');
      console.error(err);
    }
  };

  const handleRecreateInvoice = async (originalInvoiceId: string, description: string, dueDate: string) => {
    try {
      const response = await fetch('/api/invoices/recreate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalInvoiceId,
          description,
          dueDate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to recreate invoice');
      }

      toast.success('Invoice recreated successfully');
      setShowRecreateModal(false);
      fetchInvoices();
    } catch (err) {
      toast.error('Failed to recreate invoice');
      console.error(err);
    }
  };

  const handleArchiveInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'mark_uncollectible' }),
      });

      if (!response.ok) throw new Error('Failed to archive invoice');
      
      toast.success('Invoice archived successfully');
      fetchInvoices();
    } catch (err) {
      toast.error('Failed to archive invoice');
      console.error(err);
    }
  };

  const handleAction = (invoice: Invoice, action: string) => {
    switch (action) {
      case 'edit':
        setSelectedInvoice(invoice);
        break;
      case 'finalize':
        handleInvoiceAction(invoice.id, 'finalize');
        break;
      case 'pay':
        handleInvoiceAction(invoice.id, 'pay');
        break;
      case 'send':
        handleInvoiceAction(invoice.id, 'send');
        break;
      case 'credit':
        setSelectedInvoice(invoice);
        setShowCreditNoteModal(true);
        break;
      case 'recreate':
        setSelectedInvoice(invoice);
        setShowRecreateModal(true);
        break;
      case 'view':
        if (invoice.hostedUrl) handleViewInvoice(invoice.hostedUrl);
        break;
      case 'pdf':
        if (invoice.pdfUrl) handleDownloadPDF(invoice.pdfUrl);
        break;
      case 'archive':
        handleArchiveInvoice(invoice.id);
        break;
    }
  };

  const handleInvoiceAction = async (id: string, action: 'finalize' | 'pay' | 'send' | 'mark_uncollectible') => {
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} invoice`);
      }

      toast.success(`Invoice ${action}d successfully`);
      fetchInvoices();
    } catch (err) {
      toast.error(`Failed to ${action} invoice`);
      console.error(err);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (filterStatus !== 'all' && invoice.status !== filterStatus) {
      return false;
    }
    
    if (showOnlyActiveClients && !activeClientIds.has(invoice.customerId)) {
      return false;
    }

    if (invoice.status === 'uncollectible') {
      return false;
    }

    return true;
  });

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto py-10">
        <Card className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading invoices...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Invoices</h1>
            <div className="mt-2">
              <StripeSyncStatus
                onRefresh={fetchInvoices}
                lastSyncTime={lastSyncTime}
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={showOnlyActiveClients}
                onCheckedChange={setShowOnlyActiveClients}
                id="active-clients"
              />
              <label htmlFor="active-clients" className="text-sm text-gray-600">
                Show Only Active Clients
              </label>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              title="Filter invoices by status"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="open">Open</option>
              <option value="paid">Paid</option>
              <option value="void">Void</option>
            </select>
            <Button onClick={handleCreateInvoice}>
              Create Invoice
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.number || 'Draft'}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{invoice.customerName}</div>
                      <div className="text-sm text-gray-500">{invoice.customerEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: invoice.currency.toUpperCase(),
                    }).format(invoice.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      invoice.status === 'paid' ? 'success' :
                      invoice.status === 'open' ? 'warning' :
                      invoice.status === 'draft' ? 'secondary' :
                      invoice.status === 'void' ? 'destructive' : 'default'
                    }>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {invoice.dueDate ? format(new Date(invoice.dueDate), 'MMM d, yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {format(new Date(invoice.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <ActionDropdown
                        invoice={invoice}
                        onAction={(action) => handleAction(invoice, action)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredInvoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500">
                    No invoices found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Credit Note Modal */}
      {showCreditNoteModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Create Credit Note</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleCreateCreditNote(
                selectedInvoice.id,
                Number(formData.get('amount')),
                formData.get('reason') as string,
                formData.get('description') as string
              );
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <input
                    type="number"
                    name="amount"
                    step="0.01"
                    required
                    max={selectedInvoice.amount}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    title="Enter credit note amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason</label>
                  <select
                    name="reason"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    title="Select credit note reason"
                  >
                    <option value="duplicate">Duplicate</option>
                    <option value="fraudulent">Fraudulent</option>
                    <option value="order_change">Order Change</option>
                    <option value="product_unsatisfactory">Product Unsatisfactory</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                    title="Enter credit note description"
                  ></textarea>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreditNoteModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Create Credit Note
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recreate Invoice Modal */}
      {showRecreateModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Recreate Invoice</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleRecreateInvoice(
                selectedInvoice.id,
                formData.get('description') as string,
                formData.get('dueDate') as string
              );
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    defaultValue={selectedInvoice.description || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                    title="Enter invoice description"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    title="Select invoice due date"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRecreateModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Recreate Invoice
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 