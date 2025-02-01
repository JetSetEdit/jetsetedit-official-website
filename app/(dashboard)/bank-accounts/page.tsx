"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building2 } from "lucide-react";
import { BankConnectionDialog } from "@/components/bank-connection-dialog";
import { useSession } from "@/lib/auth/client";

export default function BankAccountsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const session = useSession();
  const router = useRouter();

  // Redirect to sign in if not authenticated
  if (session.status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (session.status === 'unauthenticated') {
    router.push('/auth/signin?callbackUrl=/bank-accounts');
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bank Accounts</h1>
          <p className="text-sm text-muted-foreground">
            Connect and manage your bank accounts for automatic expense tracking.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Link New Account
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Connected Accounts</CardTitle>
            <CardDescription>Your linked bank accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-sm text-muted-foreground">
              Active connections
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Last Sync</CardTitle>
            <CardDescription>Latest data synchronization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Never</div>
            <p className="text-sm text-muted-foreground">
              No accounts synced yet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>Imported transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-sm text-muted-foreground">
              Total transactions
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Get Started</CardTitle>
          <CardDescription>
            Link your bank accounts to automatically import transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 p-6">
          <Building2 className="h-12 w-12 text-muted-foreground" />
          <div className="text-center">
            <h3 className="text-lg font-semibold">No Bank Accounts Connected</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Connect your bank accounts to automatically import and categorize your transactions.
            </p>
          </div>
          <Button className="mt-4" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Link Your First Account
          </Button>
        </CardContent>
      </Card>

      <BankConnectionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
} 