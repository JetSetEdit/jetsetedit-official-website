'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { MobileMenu } from './MobileMenu';

const dashboardNavigation = [
  { name: 'Dashboard', href: '/admin' },
  { name: 'Clients', href: '/admin/clients' },
  { name: 'Projects', href: '/admin/projects' },
  { name: 'Subscriptions', href: '/admin/subscriptions' },
  { name: 'Invoices', href: '/admin/invoices' },
  { name: 'Billing', href: '/admin/billing' },
  { name: 'Tax Deductions', href: '/admin/tax-deductions' },
  { name: 'Settings', href: '/admin/settings' },
];

export function MainNavigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <nav className="bg-[#0F1117] border-b border-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/" className="text-xl font-bold text-[#00A3FF]">
                JetSetEdit
              </Link>
            </div>
            {isAdminRoute && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {dashboardNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                      pathname === item.href
                        ? 'border-b-2 border-[#00A3FF] text-white'
                        : 'border-b-2 border-transparent text-gray-400 hover:border-gray-700 hover:text-gray-200'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {status === 'loading' ? (
              <div className="text-sm text-gray-400">
                <span className="inline-block w-4 h-4 border-2 border-gray-600 border-t-[#00A3FF] rounded-full animate-spin mr-2" />
              </div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                {!isAdminRoute && (
                  <Link
                    href="/admin"
                    className="text-gray-400 hover:text-gray-200 text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                )}
                <span className="text-sm text-gray-400">{session.user?.email}</span>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-200 text-sm font-medium"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#00A3FF] hover:bg-[#0088D4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A3FF]"
              >
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          {isAdminRoute && (
            <div className="flex items-center sm:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-200 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#00A3FF]"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {/* Icon when menu is closed */}
                <svg
                  className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
                {/* Icon when menu is open */}
                <svg
                  className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu - only show for admin routes */}
      {isAdminRoute && (
        <MobileMenu
          isOpen={isMobileMenuOpen}
          session={session}
          isLoading={status === 'loading'}
          navigation={dashboardNavigation}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
}