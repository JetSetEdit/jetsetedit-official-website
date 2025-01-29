'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { MoreHorizontal } from 'lucide-react';

interface UpdateStatusProps {
  invoiceId: number;
  currentStatus: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
}

export function UpdateStatus({ invoiceId, currentStatus }: UpdateStatusProps) {
  const { toast } = useToast();
  const router = useRouter();

  const updateStatus = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      toast({
        title: 'Success',
        description: 'Invoice status has been updated.',
      });

      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const statusOptions = [
    { value: 'draft', label: 'Mark as Draft' },
    { value: 'sent', label: 'Mark as Sent' },
    { value: 'paid', label: 'Mark as Paid' },
    { value: 'overdue', label: 'Mark as Overdue' },
    { value: 'cancelled', label: 'Mark as Cancelled' },
  ].filter(option => option.value !== currentStatus);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => updateStatus(option.value)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 