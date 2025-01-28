import { ClientFilters } from './client-filters';
import { getClients } from '@/lib/db';

export default async function ClientsPage({
  searchParams
}: {
  searchParams: { q?: string; offset?: string; filter?: string };
}) {
  const search = searchParams.q ?? '';
  const offset = searchParams.offset ?? '0';
  const filter = searchParams.filter;

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
    <ClientFilters
      clients={clients}
      offset={newOffset ?? 0}
      totalClients={totalClients}
    />
  );
} 