'use client';

import SubscriptionManager from '@/components/SubscriptionManager';

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Billing Management
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Manage your hourly billing subscription and payment details.
          </p>
        </div>
        <div className="mt-12">
          <SubscriptionManager />
        </div>
      </div>
    </div>
  );
} 