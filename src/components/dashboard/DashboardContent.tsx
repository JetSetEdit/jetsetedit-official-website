'use client';

import { useAuth } from '@/context/AuthContext';
import { signOut } from '@/lib/auth';

export const DashboardContent = () => {
  const { user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <main className="p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Welcome, {user?.email}</h2>
          <p className="text-gray-600">
            You are now signed in to your account.
          </p>
        </div>
      </div>
    </main>
  );
}; 