'use client';

import { useState, useEffect } from 'react';

export default function TestInvoicePage() {
  const [result, setResult] = useState<string>('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    // Set default due date to 30 days from now
    const date = new Date();
    date.setDate(date.getDate() + 30);
    setDueDate(date.toISOString().split('T')[0]);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResult('Creating invoice...');

    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      clientId: parseInt(formData.get('clientId') as string),
      items: [{
        description: formData.get('description') as string,
        quantity: parseInt(formData.get('quantity') as string),
        unitPrice: parseFloat(formData.get('unitPrice') as string)
      }],
      dueDate: formData.get('dueDate') as string
    };

    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      setResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Test Invoice Creation</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">Client ID:</label>
          <input
            type="number"
            id="clientId"
            name="clientId"
            defaultValue="2"
            readOnly
            title="Nick Schaffer's client ID"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description:</label>
          <input
            type="text"
            id="description"
            name="description"
            defaultValue="Website Development"
            placeholder="Enter service description"
            title="Service description"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity:</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            defaultValue="1"
            placeholder="Enter quantity"
            title="Service quantity"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700">Unit Price:</label>
          <input
            type="number"
            id="unitPrice"
            name="unitPrice"
            defaultValue="2500"
            placeholder="Enter price per unit"
            title="Price per unit"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date:</label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            title="Invoice due date"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Create Invoice
        </button>
      </form>
      <pre className="mt-6 p-4 border rounded-md whitespace-pre-wrap">{result}</pre>
    </div>
  );
} 