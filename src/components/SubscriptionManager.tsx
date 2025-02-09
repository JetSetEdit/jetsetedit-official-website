'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useSession } from 'next-auth/react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Plan {
  id: string;
  name: string;
  description: string;
  priceId: string;
  unitAmount: number;
  currency: string;
  interval: string;
  intervalCount: number;
  features: string[];
}

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
        className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-md"
      >
        {processing ? 'Processing...' : 'Subscribe'}
      </button>
    </form>
  );
}

export default function SubscriptionManager() {
  const { data: session } = useSession();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/subscriptions/plans');
        if (!response.ok) {
          throw new Error('Failed to fetch plans');
        }
        const data = await response.json();
        setPlans(data);
      } catch (err) {
        setError('Failed to load subscription plans');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handlePlanSelect = async (plan: Plan) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          email: session?.user?.email,
          name: session?.user?.name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
      setSelectedPlan(plan);
    } catch (err) {
      setError('Failed to set up subscription');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentIntent: any) => {
    // Handle successful payment
    console.log('Payment successful:', paymentIntent);
    // You might want to redirect to a success page or update UI
  };

  if (loading) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {!clientSecret ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="border rounded-lg p-6 space-y-4 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="text-gray-600">{plan.description}</p>
              <div className="text-2xl font-bold">
                {plan.currency && new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: plan.currency.toUpperCase(),
                }).format(plan.unitAmount)}
                <span className="text-sm font-normal text-gray-500">
                  /{plan.interval}
                </span>
              </div>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handlePlanSelect(plan)}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Select Plan
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-semibold mb-4">
            Complete your subscription to {selectedPlan?.name}
          </h3>
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
    </div>
  );
} 