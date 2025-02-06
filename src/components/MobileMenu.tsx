'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileMenuProps {
  isOpen: boolean;
  session: any;
  isLoading: boolean;
  navigation: Array<{ name: string; href: string }>;
  onClose: () => void;
}

export function MobileMenu({ isOpen, session, isLoading, navigation, onClose }: MobileMenuProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <div className="sm:hidden">
      {session && (
        <div className="space-y-1 pb-3 pt-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`block border-l-4 py-2 pl-3 pr-4 text-base font-medium ${
                pathname === item.href
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700'
              }`}
              onClick={onClose}
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
      <div className="border-t border-gray-200 pb-3 pt-4">
        {isLoading ? (
          <div className="px-4 text-sm text-gray-500">Loading...</div>
        ) : session ? (
          <div className="space-y-1 px-4">
            <p className="text-sm text-gray-500">{session.user?.email}</p>
            <button
              onClick={() => {
                onClose();
                signOut({ callbackUrl: '/' });
              }}
              className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="px-4">
            <Link
              href="/auth/signin"
              onClick={onClose}
              className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 