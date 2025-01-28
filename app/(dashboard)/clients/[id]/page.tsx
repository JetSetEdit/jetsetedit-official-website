import { notFound } from 'next/navigation';
import { getClientById } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Building2, Mail, Phone, Globe, MapPin, FileText, CreditCard } from 'lucide-react';
import { ClientInvoicesTable } from './client-invoices-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Props = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function ClientPage({ params, searchParams }: Props) {
  const clientData = await getClientById(Number(params.id));

  if (!clientData) {
    notFound();
  }

  const { client, recentInvoices, stats } = clientData;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
          <p className="text-sm text-muted-foreground">
            Client #{client.id} • Added on {new Date(client.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Badge 
          variant={client.status === 'active' ? 'default' : 'secondary'}
          className="capitalize"
        >
          {client.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvoices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalPaid)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalOutstanding)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Invoice</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.averageInvoiceAmount)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="invoices">Recent Invoices</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
              <CardDescription>Detailed information about the client.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <div>
                    <div className="text-sm font-medium">Company</div>
                    <div className="text-sm text-muted-foreground">{client.company || 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <div>
                    <div className="text-sm font-medium">Email</div>
                    <div className="text-sm text-muted-foreground">{client.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <div>
                    <div className="text-sm font-medium">Phone</div>
                    <div className="text-sm text-muted-foreground">{client.phone || 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <div>
                    <div className="text-sm font-medium">Website</div>
                    <div className="text-sm text-muted-foreground">{client.website || 'N/A'}</div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">Billing Address</div>
                    <div className="text-sm text-muted-foreground whitespace-pre-line">
                      {client.billingAddress || 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">Shipping Address</div>
                    <div className="text-sm text-muted-foreground whitespace-pre-line">
                      {client.shippingAddress || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
              <CardDescription>Business and account information.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium">Industry</div>
                  <div className="text-sm text-muted-foreground">{client.industry || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Tax Number</div>
                  <div className="text-sm text-muted-foreground">{client.taxNumber || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Account Manager</div>
                  <div className="text-sm text-muted-foreground">{client.accountManager || 'N/A'}</div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium">Payment Terms</div>
                  <div className="text-sm text-muted-foreground">{client.paymentTerms || 'N/A'} days</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Credit Limit</div>
                  <div className="text-sm text-muted-foreground">
                    {client.creditLimit ? formatCurrency(Number(client.creditLimit)) : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Currency</div>
                  <div className="text-sm text-muted-foreground">{client.currency}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          {client.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{client.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="invoices">
          <ClientInvoicesTable invoices={recentInvoices} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 