'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AddClientDialogProps {
  children: React.ReactNode;
}

export function AddClientDialog({ children }: AddClientDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  function isValidUrl(string: string) {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const data = {
        name: formData.get('name') as string,
        company: formData.get('company') as string || undefined,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string || undefined,
        type: formData.get('type') as 'individual' | 'business' | 'agency',
        website: formData.get('website') as string || undefined,
        notes: formData.get('notes') as string || undefined,
      };

      // Validate required fields
      if (!data.name || !data.email || !data.type) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Validate website URL if provided
      if (data.website && !isValidUrl(data.website)) {
        toast({
          title: 'Error',
          description: 'Please enter a valid website URL (e.g., https://example.com)',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Clean up empty strings to undefined
      const cleanData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          value === '' ? undefined : value
        ])
      );

      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create client');
      }

      toast({
        title: 'Success',
        description: 'Client has been created successfully.',
      });

      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error creating client:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create client. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            Fill in the client details below. Required fields are marked with an asterisk (*).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name *
              </Label>
              <Input
                id="name"
                name="name"
                className="col-span-3"
                required
                disabled={loading}
                placeholder="Enter client name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company" className="text-right">
                Company
              </Label>
              <Input
                id="company"
                name="company"
                className="col-span-3"
                disabled={loading}
                placeholder="Enter company name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                className="col-span-3"
                required
                disabled={loading}
                placeholder="Enter email address"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                className="col-span-3"
                disabled={loading}
                placeholder="Enter phone number"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type *
              </Label>
              <Select name="type" defaultValue="individual" required>
                <SelectTrigger className="col-span-3" disabled={loading}>
                  <SelectValue placeholder="Select client type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="agency">Agency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="website" className="text-right">
                Website
              </Label>
              <Input
                id="website"
                name="website"
                type="url"
                className="col-span-3"
                disabled={loading}
                placeholder="Enter website URL"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                name="notes"
                className="col-span-3"
                disabled={loading}
                placeholder="Add any additional notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="mr-2">Creating...</span>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </>
              ) : (
                'Create Client'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 