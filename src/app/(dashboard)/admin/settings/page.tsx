'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Settings {
  stripeConnected: boolean;
  defaultCurrency: string;
  defaultPaymentTerms: number;
  emailNotifications: boolean;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [settings, setSettings] = useState<Settings>({
    stripeConnected: false,
    defaultCurrency: 'USD',
    defaultPaymentTerms: 30,
    emailNotifications: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/settings');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch settings');
        }
        
        const data = await response.json();
        setSettings(data);
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchSettings();
    }
  }, [status]);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save settings');
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto py-10">
        <Card className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading settings...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-500 rounded-md">
            {error}
          </div>
        )}

        {saved && (
          <div className="mb-6 p-4 bg-green-50 text-green-500 rounded-md">
            Settings saved successfully!
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium mb-4">Stripe Integration</h2>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
              <div>
                <p className="font-medium">Connection Status</p>
                <p className="text-sm text-gray-500">Your Stripe account connection</p>
              </div>
              <Badge variant={settings.stripeConnected ? 'success' : 'destructive'}>
                {settings.stripeConnected ? 'Connected' : 'Not Connected'}
              </Badge>
            </div>
            {!settings.stripeConnected && (
              <div className="mt-2 p-4 bg-yellow-50 text-yellow-700 rounded-md">
                <p className="text-sm">
                  Please check your Stripe configuration in the environment variables:
                </p>
                <ul className="list-disc list-inside mt-2 text-sm">
                  <li>STRIPE_SECRET_KEY</li>
                  <li>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</li>
                  <li>STRIPE_WEBHOOK_SECRET</li>
                </ul>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-medium mb-4">Billing Settings</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="defaultCurrency" className="block text-sm font-medium text-gray-700">
                  Default Currency
                </label>
                <select
                  id="defaultCurrency"
                  name="defaultCurrency"
                  title="Select default currency"
                  aria-label="Select default currency"
                  value={settings.defaultCurrency}
                  onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                </select>
              </div>

              <div>
                <label htmlFor="paymentTerms" className="block text-sm font-medium text-gray-700">
                  Default Payment Terms (days)
                </label>
                <input
                  id="paymentTerms"
                  name="paymentTerms"
                  type="number"
                  title="Enter default payment terms in days"
                  aria-label="Enter default payment terms in days"
                  placeholder="Enter number of days"
                  value={settings.defaultPaymentTerms}
                  onChange={(e) => setSettings({ ...settings, defaultPaymentTerms: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium mb-4">Notifications</h2>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="emailNotifications"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="emailNotifications" className="text-sm text-gray-700">
                Receive email notifications for new invoices and payments
              </label>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
} 