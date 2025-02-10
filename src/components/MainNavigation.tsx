'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { MobileMenu } from './MobileMenu';

const publicNavigation = [
  { name: 'Pricing', href: '/pricing' },
  { name: 'Portfolio', href: '/portfolio' },
  { name: 'Contact', href: '/contact' },
];

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
  const navigation = isAdminRoute ? dashboardNavigation : publicNavigation;

  // Only show loading when transitioning between states
  const isLoading = status === 'loading';

  // Handle session state more gracefully
  const showSignIn = !isLoading && !session;
  const showUserMenu = !isLoading && session;

  return (
    <nav className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                JetSetEdit
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    pathname === item.href
                      ? 'border-b-2 border-blue-500 text-gray-900'
                      : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isLoading ? (
              <div className="text-sm text-gray-500">
                <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-2" />
              </div>
            ) : showUserMenu ? (
              <div className="flex items-center space-x-4">
                {!isAdminRoute && (
                  <Link
                    href="/admin"
                    className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                )}
                <span className="text-sm text-gray-500">{session.user?.email}</span>
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  Sign out
                </button>
              </div>
            ) : showSignIn ? (
              <Link
                href="/auth/signin"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign in
              </Link>
            ) : null}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
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
        </div>
      </div>

      {/* Mobile menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        session={session}
        isLoading={isLoading}
        navigation={navigation}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </nav>
  );
}