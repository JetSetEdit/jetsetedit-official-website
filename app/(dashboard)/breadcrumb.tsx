'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';

export function DashboardBreadcrumb() {
  const pathname = usePathname();
  
  let breadcrumbItems = [];
  
  // Always start with Dashboard
  breadcrumbItems.push({
    label: 'Dashboard',
    href: '/',
    current: pathname === '/'
  });

  // Add additional items based on pathname
  if (pathname.startsWith('/clients')) {
    breadcrumbItems.push({
      label: 'Clients',
      href: '/clients',
      current: true
    });
  } else if (pathname.startsWith('/invoices')) {
    breadcrumbItems.push({
      label: 'Invoices',
      href: '/invoices',
      current: true
    });
  } else if (pathname.startsWith('/settings')) {
    breadcrumbItems.push({
      label: 'Settings',
      href: '/settings',
      current: true
    });
  }

  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.href}>
            <BreadcrumbItem>
              {item.current ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
} 