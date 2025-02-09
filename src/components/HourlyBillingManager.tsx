'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { BillingTutorial } from './BillingTutorial';

interface UsageRecord {
  itemId: string;
  priceId: string;
  priceName: string;
  unitAmount: number;
  currency: string;
  usage: Array<{
    total_usage: number;
    period: {
      start: number;
      end: number;
    };
  }>;
  currentPeriodStart: number;
  currentPeriodEnd: number;
}

interface UsageData {
  subscriptionId: string;
  usageData: UsageRecord[];
}

export default function HourlyBillingManager({ subscriptionId }: { subscriptionId: string }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [hoursToAdd, setHoursToAdd] = useState(1);
  const [showTutorial, setShowTutorial] = useState(true);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchUsage();
  }, [subscriptionId]);

  const fetchUsage = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/billing/usage?subscriptionId=${subscriptionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch usage data');
      }

      const data = await response.json();
      setUsageData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load usage data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reportHours = async (subscriptionItemId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/billing/report-hours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionItemId,
          hours: hoursToAdd,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to report hours');
      }

      await fetchUsage(); // Refresh usage data
      setHoursToAdd(1); // Reset hours input
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to report hours');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateInvoice = async () => {
    try {
      setGeneratingInvoice(true);
      setError(null);

      const response = await fetch('/api/billing/create-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
          description: 'Video editing services - Hours worked',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate invoice');
      }

      const data = await response.json();
      setInvoiceUrl(data.invoiceUrl);
      await fetchUsage(); // Refresh usage data after invoice generation
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate invoice');
      console.error(err);
    } finally {
      setGeneratingInvoice(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading usage data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-4">
        <p>{error}</p>
      </div>
    );
  }

  if (!usageData || !usageData.usageData.length) {
    return (
      <div className="text-center text-gray-500 py-4">
        <p>No hourly billing data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {showTutorial && (
        <div className="relative">
          <BillingTutorial />
          <button
            onClick={() => setShowTutorial(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            aria-label="Close tutorial"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {!showTutorial && (
        <button
          onClick={() => setShowTutorial(true)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Show Tutorial
        </button>
      )}

      <div className="space-y-6">
        {usageData.usageData.map((record) => (
          <div key={record.itemId} className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{record.priceName}</h3>
                <p className="text-sm text-gray-500">
                  Current period: {format(record.currentPeriodStart * 1000, 'MMM d, yyyy')} -{' '}
                  {format(record.currentPeriodEnd * 1000, 'MMM d, yyyy')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">
                  {record.currency && new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: record.currency.toUpperCase(),
                  }).format(record.unitAmount)}/hour
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="sr-only" htmlFor="hoursInput">Number of hours to add</label>
                <input
                  id="hoursInput"
                  type="number"
                  min="1"
                  value={hoursToAdd}
                  onChange={(e) => setHoursToAdd(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 px-3 py-2 border rounded-md"
                  aria-label="Number of hours to add"
                  placeholder="Hours"
                />
                <button
                  onClick={() => reportHours(record.itemId)}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Adding...' : 'Add Hours'}
                </button>
              </div>

              <div>
                <h4 className="font-medium mb-2">Usage History</h4>
                <div className="space-y-2">
                  {record.usage.map((usage, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {format(usage.period.start * 1000, 'MMM d, yyyy')} -{' '}
                        {format(usage.period.end * 1000, 'MMM d, yyyy')}
                      </span>
                      <span className="font-medium">{usage.total_usage} hours</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <div className="flex justify-between text-sm font-medium mb-4">
                  <span>Total Cost (Current Period)</span>
                  <span>
                    {record.currency && new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: record.currency.toUpperCase(),
                    }).format(record.usage[0]?.total_usage * record.unitAmount || 0)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={generateInvoice}
                    disabled={generatingInvoice || !record.usage[0]?.total_usage}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {generatingInvoice ? 'Generating...' : 'Generate Invoice'}
                  </button>
                  
                  {invoiceUrl && (
                    <a
                      href={invoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View Latest Invoice
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 