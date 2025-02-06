'use client';

import { ReactNode } from 'react';

function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="border-t border-gray-200 pt-4">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} JetSetEdit. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
      <Footer />
    </div>
  );
} 