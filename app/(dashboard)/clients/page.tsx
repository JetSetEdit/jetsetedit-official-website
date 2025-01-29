import { ClientFilters } from './client-filters';
import { getClients } from '@/lib/db';
import type { PageProps } from 'next';

type Props = PageProps<
  {},
  {
    q?: string;
    offset?: string;
    filter?: string;
  }
>;

export default async function ClientsPage({ searchParams }: Props) {
  const searchParamsData = await Promise.resolve(searchParams);
  const search = searchParamsData.q ?? '';
  const offset = searchParamsData.offset ?? '0';
  const filter = searchParamsData.filter;

  // Define valid client types and statuses
  const validTypes = ['individual', 'business', 'agency'] as const;
  const validStatuses = ['active'] as const;

  // Create filter configuration
  const filterConfig = filter ? {
    type: validTypes.includes(filter as any) ? filter as typeof validTypes[number] : undefined,
    status: validStatuses.includes(filter as any) ? filter as typeof validStatuses[number] : undefined
  } : undefined;

  const { clients, newOffset, totalClients } = await getClients(
    search,
    Number(offset),
    filterConfig
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground">
            Manage your client relationships.
          </p>
        </div>
      </div>
      <ClientFilters
        clients={clients}
        offset={newOffset ?? 0}
        totalClients={totalClients}
      />
    </div>
  );
} 