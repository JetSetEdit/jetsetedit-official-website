'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Eye, Receipt, Download } from "lucide-react";
import Link from "next/link";

interface Expense {
  id: number;
  date: string;
  amount: string;
  description: string;
  category: string;
  status: string;
  isDeductible: boolean;
  receiptUrl?: string;
}

interface ExpensesTableProps {
  expenses: Expense[];
}

export function ExpensesTable({ expenses }: ExpensesTableProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredExpenses = selectedCategory
    ? expenses.filter((expense) => expense.category === selectedCategory)
    : expenses;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Tax Deductible</TableHead>
            <TableHead>Receipt</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredExpenses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No expenses found.
              </TableCell>
            </TableRow>
          ) : (
            filteredExpenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{formatDate(expense.date)}</TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {expense.category.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>{formatCurrency(Number(expense.amount))}</TableCell>
                <TableCell>
                  {expense.isDeductible ? (
                    <Badge variant="default">Yes</Badge>
                  ) : (
                    <Badge variant="secondary">No</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {expense.receiptUrl ? (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Receipt className="h-4 w-4" />
                    </Button>
                  ) : (
                    <span className="text-muted-foreground">No receipt</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/expenses/${expense.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                    </Link>
                    {expense.receiptUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => window.open(expense.receiptUrl, '_blank')}
                      >
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download Receipt</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
} 