'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { FileUpload } from "@/components/file-upload";
import { useToast } from "@/hooks/use-toast";

export default function NewExpensePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeductible, setIsDeductible] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const data = {
        amount: Number(formData.get('amount')),
        date: new Date(formData.get('date') as string),
        description: formData.get('description'),
        category: formData.get('category'),
        isDeductible,
        deductionCategory: isDeductible ? formData.get('deductionCategory') : null,
        notes: isDeductible ? formData.get('notes') : null,
        receiptUrl,
      };

      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create expense');
      }

      toast({
        title: 'Success',
        description: 'Expense has been saved successfully.',
      });

      router.push('/expenses');
      router.refresh();
    } catch (error) {
      console.error('Error saving expense:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save expense',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadComplete = (url: string) => {
    setReceiptUrl(url);
    toast({
      title: "Receipt uploaded",
      description: "Your receipt has been uploaded successfully.",
    });
  };

  const handleUploadError = (error: Error) => {
    toast({
      title: "Upload failed",
      description: error.message,
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/expenses">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Expense</h1>
          <p className="text-sm text-muted-foreground">
            Add a new expense and upload related receipts.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Expense Details</CardTitle>
            <CardDescription>Enter the basic details of your expense.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                placeholder="Enter expense description"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="office_supplies">Office Supplies</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="meals">Meals & Entertainment</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="software">Software & Subscriptions</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="rent">Rent</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="professional_services">Professional Services</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receipt</CardTitle>
            <CardDescription>Upload a receipt for this expense.</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              accept="image/*,.pdf"
              maxSize={10 * 1024 * 1024} // 10MB
            />
            {receiptUrl && (
              <div className="mt-4 text-sm text-muted-foreground">
                Receipt uploaded successfully
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tax Deduction</CardTitle>
            <CardDescription>Specify if this expense is tax deductible.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="deductible"
                checked={isDeductible}
                onCheckedChange={setIsDeductible}
              />
              <Label htmlFor="deductible">This expense is tax deductible</Label>
            </div>
            {isDeductible && (
              <div className="space-y-2">
                <Label htmlFor="deductionCategory">Deduction Category</Label>
                <Select name="deductionCategory">
                  <SelectTrigger>
                    <SelectValue placeholder="Select deduction category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business_use">Business Use of Home</SelectItem>
                    <SelectItem value="vehicle">Vehicle Expenses</SelectItem>
                    <SelectItem value="travel">Travel Expenses</SelectItem>
                    <SelectItem value="education">Education & Training</SelectItem>
                    <SelectItem value="insurance">Insurance Premiums</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  name="notes"
                  placeholder="Add any notes about the tax deduction..."
                  className="mt-2"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Expense'}
          </Button>
        </div>
      </form>
    </div>
  );
} 