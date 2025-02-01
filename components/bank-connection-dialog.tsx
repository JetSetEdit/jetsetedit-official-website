import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { BasiqInstitution } from '@/lib/basiq';

interface BankConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BankConnectionDialog({
  open,
  onOpenChange,
}: BankConnectionDialogProps) {
  const [institutions, setInstitutions] = useState<BasiqInstitution[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch institutions when dialog opens
  useEffect(() => {
    if (open) {
      fetchInstitutions();
    }
  }, [open]);

  async function fetchInstitutions() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/bank-accounts/institutions', {
        credentials: 'include'
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch institutions');
      }
      const data = await response.json();
      setInstitutions(data);
    } catch (error) {
      console.error('Error fetching institutions:', error);
      setError(error instanceof Error ? error.message : 'Failed to load banks. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function connectBank(institutionId: string) {
    try {
      setConnecting(true);
      setError(null);
      const response = await fetch('/api/bank-accounts/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ institutionId }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to initiate connection');
      }
      
      window.location.href = data.connectionUrl;
    } catch (error) {
      console.error('Error connecting bank:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect bank. Please try again.');
    } finally {
      setConnecting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Bank Account</DialogTitle>
          <DialogDescription>
            Select your bank to securely connect your account.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="text-sm text-red-500 mb-4">
            {error}
          </div>
        )}

        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              {institutions.map((institution) => (
                <Button
                  key={institution.id}
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                  onClick={() => connectBank(institution.id)}
                  disabled={connecting}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 relative">
                      <Image
                        src={institution.logo.links.square}
                        alt={institution.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{institution.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {institution.country}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 