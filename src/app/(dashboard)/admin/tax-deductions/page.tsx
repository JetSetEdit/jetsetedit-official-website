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
import { format } from 'date-fns';
import { TAX_CATEGORIES } from '@/app/api/tax-deductions/route';

interface TaxDeduction {
  id: string;
  date: string;
  category: keyof typeof TAX_CATEGORIES;
  description: string;
  amount: number;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export default function TaxDeductionsPage() {
  const { data: session, status } = useSession();
  const [deductions, setDeductions] = useState<TaxDeduction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<TaxDeduction>>({
    date: new Date().toISOString().split('T')[0],
    category: 'OTHER',
    description: '',
    amount: 0,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDeductions();
    }
  }, [status]);

  const fetchDeductions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tax-deductions');
      if (!response.ok) {
        throw new Error('Failed to fetch deductions');
      }
      const data = await response.json();
      setDeductions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deductions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? '/api/tax-deductions' : '/api/tax-deductions';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { ...formData, id: editingId } : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to save deduction');
      }

      await fetchDeductions();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: 'OTHER',
        description: '',
        amount: 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save deduction');
      console.error(err);
    }
  };

  const handleEdit = (deduction: TaxDeduction) => {
    setFormData({
      date: deduction.date,
      category: deduction.category,
      description: deduction.description,
      amount: deduction.amount,
      receiptUrl: deduction.receiptUrl,
    });
    setEditingId(deduction.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this deduction?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tax-deductions?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete deduction');
      }

      await fetchDeductions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete deduction');
      console.error(err);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto py-10">
        <Card className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading tax deductions...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Tax Deductions</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : 'Add Deduction'}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-500 rounded-md">
            {error}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as keyof typeof TAX_CATEGORIES })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {Object.entries(TAX_CATEGORIES).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Receipt URL (optional)</label>
                <input
                  type="url"
                  value={formData.receiptUrl || ''}
                  onChange={(e) => setFormData({ ...formData, receiptUrl: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="https://"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                {editingId ? 'Update' : 'Save'} Deduction
              </button>
            </div>
          </form>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deductions.map((deduction) => (
                <TableRow key={deduction.id}>
                  <TableCell>{format(new Date(deduction.date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {TAX_CATEGORIES[deduction.category]}
                    </Badge>
                  </TableCell>
                  <TableCell>{deduction.description}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'AUD',
                    }).format(deduction.amount)}
                  </TableCell>
                  <TableCell>
                    {deduction.receiptUrl && (
                      <a
                        href={deduction.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        View Receipt
                      </a>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(deduction)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(deduction.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {deductions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    No tax deductions recorded
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h2 className="text-lg font-medium mb-2">Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Deductions</p>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'AUD',
                }).format(deductions.reduce((sum, d) => sum + d.amount, 0))}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Number of Items</p>
              <p className="text-2xl font-bold">{deductions.length}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 