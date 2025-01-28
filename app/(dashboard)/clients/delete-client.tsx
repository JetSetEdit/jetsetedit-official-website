'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { SelectClient } from '@/lib/db';
import { deleteClient } from './actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DeleteClient({
  client,
  open,
  onOpenChange
}: {
  client: SelectClient;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleDelete(formData: FormData) {
    try {
      setLoading(true);
      setError(null);
      const result = await deleteClient(formData);
      if (result.error) {
        setError(result.error);
      } else {
        onOpenChange(false);
        router.refresh();
      }
    } catch (e) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the client{' '}
            <strong>{client.name}</strong> and remove their data from the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={handleDelete}>
            <input type="hidden" name="id" value={client.id} />
            <AlertDialogAction type="submit" disabled={loading}>
              {loading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 