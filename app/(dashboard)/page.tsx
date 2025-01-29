import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users2, Receipt, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { getDashboardStats } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Link href="/clients" className="transition-transform hover:scale-105">
        <Card className="cursor-pointer hover:border-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newClientsLastMonth} from last month
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/invoices" className="transition-transform hover:scale-105">
        <Card className="cursor-pointer hover:border-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvoices}</div>
            <p className="text-xs text-muted-foreground">
              {stats.overdueInvoices + stats.paidInvoices} processed
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/invoices?status=overdue" className="transition-transform hover:scale-105">
        <Card className="cursor-pointer hover:border-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overdueInvoices}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.overdueAmount)} total
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/invoices?status=paid" className="transition-transform hover:scale-105">
        <Card className="cursor-pointer hover:border-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paidInvoices}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.paidAmount)} received
            </p>
          </CardContent>
        </Card>
      </Link>

      {/* Add more dashboard components here like:
         - Recent Invoices
         - Payment Status Chart
         - Top Clients
         - Monthly Revenue Chart
      */}
    </div>
  );
}
