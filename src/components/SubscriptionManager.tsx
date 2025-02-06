'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface SubscriptionFormProps {
  clientSecret: string;
  onSuccess: (result: any) => void;
}

function SubscriptionForm({ clientSecret, onSuccess }: SubscriptionFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    const { error: submitError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/billing/success`,
      },
      redirect: 'if_required',
    });

    if (submitError) {
      setError(submitError.message || 'An error occurred');
      setProcessing(false);
    } else if (paymentIntent) {
      onSuccess(paymentIntent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {processing ? 'Processing...' : 'Subscribe'}
      </button>
    </form>
  );
}

export default function SubscriptionManager() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const createSubscription = async (formData: {
    email: string;
    name: string;
    hourlyRate: number;
    hoursPerInterval: number;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create subscription');
      }

      setClientSecret(data.clientSecret);
      setSubscription(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntent: any) => {
    // Handle successful payment
    console.log('Payment successful:', paymentIntent);
  };

  const updateHours = async (hours: number) => {
    if (!subscription?.subscriptionId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/subscriptions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscription.subscriptionId,
          hoursPerInterval: hours,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update hours');
      }

      // Update local subscription state
      setSubscription((prev: any) => ({
        ...prev,
        hoursPerInterval: hours,
      }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const pauseSubscription = async () => {
    if (!subscription?.subscriptionId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/subscriptions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscription.subscriptionId,
          action: 'pause',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to pause subscription');
      }

      // Update local subscription state
      setSubscription((prev: any) => ({
        ...prev,
        status: 'paused',
      }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const resumeSubscription = async () => {
    if (!subscription?.subscriptionId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/subscriptions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscription.subscriptionId,
          action: 'resume',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resume subscription');
      }

      // Update local subscription state
      setSubscription((prev: any) => ({
        ...prev,
        status: 'active',
      }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    if (!subscription?.subscriptionId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/subscriptions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscription.subscriptionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      // Update local subscription state
      setSubscription((prev: any) => ({
        ...prev,
        status: 'canceled',
      }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Hourly Billing Subscription</h1>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded mb-4">
          {error}
        </div>
      )}

      {!subscription && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Create New Subscription</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              createSubscription({
                email: formData.get('email') as string,
                name: formData.get('name') as string,
                hourlyRate: Number(formData.get('hourlyRate')),
                hoursPerInterval: Number(formData.get('hoursPerInterval')),
              });
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                aria-label="Email address"
                className="mt-1 block w-full rounded border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                name="name"
                required
                aria-label="Full name"
                className="mt-1 block w-full rounded border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hourly Rate (USD)
              </label>
              <input
                type="number"
                name="hourlyRate"
                min="1"
                required
                aria-label="Hourly rate in USD"
                className="mt-1 block w-full rounded border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hours per Interval
              </label>
              <input
                type="number"
                name="hoursPerInterval"
                min="1"
                required
                aria-label="Number of hours per billing interval"
                className="mt-1 block w-full rounded border-gray-300 shadow-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Subscription'}
            </button>
          </form>
        </div>
      )}

      {clientSecret && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
              },
            }}
          >
            <SubscriptionForm
              clientSecret={clientSecret}
              onSuccess={handlePaymentSuccess}
            />
          </Elements>
        </div>
      )}

      {subscription && subscription.status !== 'canceled' && (
        <div className="mt-6 space-y-4">
          <h2 className="text-xl font-semibold">Manage Subscription</h2>
          
          <div className="flex space-x-4">
            <button
              onClick={() => updateHours(subscription.hoursPerInterval + 1)}
              disabled={loading}
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
            >
              Increase Hours
            </button>
            <button
              onClick={() => updateHours(Math.max(1, subscription.hoursPerInterval - 1))}
              disabled={loading || subscription.hoursPerInterval <= 1}
              className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 disabled:opacity-50"
            >
              Decrease Hours
            </button>
          </div>

          <div className="flex space-x-4">
            {subscription.status === 'active' ? (
              <button
                onClick={pauseSubscription}
                disabled={loading}
                className="bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 disabled:opacity-50"
              >
                Pause Subscription
              </button>
            ) : (
              <button
                onClick={resumeSubscription}
                disabled={loading}
                className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
              >
                Resume Subscription
              </button>
            )}

            <button
              onClick={cancelSubscription}
              disabled={loading}
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:opacity-50"
            >
              Cancel Subscription
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 