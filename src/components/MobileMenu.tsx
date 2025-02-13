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

export function MobileMenu({
  isOpen,
  session,
  isLoading,
  navigation,
  onClose,
}: MobileMenuProps) {
  const pathname = usePathname();

  return (
    <div className={`sm:hidden ${isOpen ? 'block' : 'hidden'}`}>
      <div className="space-y-1 pb-3 pt-2 bg-[#0F1117] border-b border-gray-800">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`block px-3 py-2 text-base font-medium ${
              pathname === item.href
                ? 'text-blue-500'
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
            onClick={onClose}
          >
            {item.name}
          </Link>
        ))}
      </div>
      <div className="border-t border-gray-800 pb-3 pt-4 bg-[#0F1117]">
        <div className="space-y-1 px-3">
          {isLoading ? (
            <div className="text-sm text-gray-400">
              <span className="inline-block w-4 h-4 border-2 border-gray-600 border-t-[#00A3FF] rounded-full animate-spin mr-2" />
              Loading...
            </div>
          ) : session ? (
            <>
              <div className="text-base font-medium text-gray-400">
                {session.user?.email}
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="block px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              onClick={onClose}
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
} 