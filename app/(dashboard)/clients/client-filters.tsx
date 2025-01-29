'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { File, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClientsTable } from './clients-table';
import { useRouter, useSearchParams } from 'next/navigation';
import { SelectClient } from '@/lib/db';
import { AddClientDialog } from './add-client-dialog';

export function ClientFilters({
  clients,
  offset,
  totalClients
}: {
  clients: SelectClient[];
  offset: number;
  totalClients: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get('filter') ?? 'all';

  // Separate status and type filters
  const filterValues = ['all', 'individual', 'business', 'agency'];
  const statusValues = ['active'];

  const allFilters = [...filterValues, ...statusValues];
  
  return (
    <Tabs 
      defaultValue={currentFilter}
      onValueChange={(value) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === 'all') {
          params.delete('filter');
        } else {
          params.set('filter', value);
        }
        router.push(`/clients?${params.toString()}`);
      }}
    >
      <div className="flex items-center">
        <TabsList>
          {filterValues.map(value => (
            <TabsTrigger key={value} value={value} className="capitalize">
              {value}
            </TabsTrigger>
          ))}
          <TabsTrigger value="active" className="capitalize">
            Active
          </TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Button>
          <AddClientDialog>
            <Button size="sm" className="h-8 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Client
              </span>
            </Button>
          </AddClientDialog>
        </div>
      </div>
      {allFilters.map(value => (
        <TabsContent key={value} value={value} className="mt-4">
          <ClientsTable
            clients={clients}
            offset={offset}
            totalClients={totalClients}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
} 