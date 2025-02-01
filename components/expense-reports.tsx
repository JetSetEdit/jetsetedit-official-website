'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileSpreadsheet, Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Expense {
  id: number;
  date: string;
  amount: string;
  description: string;
  category: string;
  isDeductible: boolean;
  deductionCategory?: string;
  deductibleAmount?: string;
  jurisdiction?: string;
  taxYear?: number;
}

interface ExpenseReportsProps {
  expenses: Expense[];
}

export function ExpenseReports({ expenses }: ExpenseReportsProps) {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('all');

  const filteredExpenses = expenses.filter(expense => {
    const matchesYear = expense.taxYear === selectedYear;
    const matchesJurisdiction = selectedJurisdiction === 'all' || expense.jurisdiction === selectedJurisdiction;
    return expense.isDeductible && matchesYear && matchesJurisdiction;
  });

  const calculateTotals = () => {
    return filteredExpenses.reduce((acc, expense) => {
      const category = expense.deductionCategory || 'uncategorized';
      const amount = parseFloat(expense.deductibleAmount || expense.amount);
      
      if (!acc[category]) {
        acc[category] = {
          count: 0,
          total: 0,
        };
      }
      
      acc[category].count += 1;
      acc[category].total += amount;
      
      return acc;
    }, {} as Record<string, { count: number; total: number; }>);
  };

  const totals = calculateTotals();
  const totalDeductions = Object.values(totals).reduce((sum, { total }) => sum + total, 0);

  const downloadReport = () => {
    // Implementation for downloading report as CSV/Excel
    console.log('Downloading report...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tax Deduction Reports</h2>
          <p className="text-sm text-muted-foreground">
            Analyze and export your tax deductions
          </p>
        </div>
        <Button onClick={downloadReport} variant="outline">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tax Year</Label>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2023, 2022].map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Jurisdiction</Label>
              <Select
                value={selectedJurisdiction}
                onValueChange={setSelectedJurisdiction}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select jurisdiction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jurisdictions</SelectItem>
                  <SelectItem value="federal">Federal</SelectItem>
                  <SelectItem value="state">State</SelectItem>
                  <SelectItem value="local">Local</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>
              Total deductions for {selectedYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalDeductions)}
            </div>
            <p className="text-sm text-muted-foreground">
              Across {filteredExpenses.length} expenses
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deductions by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Count</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>% of Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(totals).map(([category, { count, total }]) => (
                <TableRow key={category}>
                  <TableCell className="font-medium capitalize">
                    {category.replace(/_/g, ' ')}
                  </TableCell>
                  <TableCell>{count}</TableCell>
                  <TableCell>{formatCurrency(total)}</TableCell>
                  <TableCell>
                    {((total / totalDeductions) * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Deduction Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Deductible Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell className="capitalize">
                    {expense.category.replace(/_/g, ' ')}
                  </TableCell>
                  <TableCell className="capitalize">
                    {expense.deductionCategory?.replace(/_/g, ' ') || 'N/A'}
                  </TableCell>
                  <TableCell>{formatCurrency(parseFloat(expense.amount))}</TableCell>
                  <TableCell>
                    {expense.deductibleAmount
                      ? formatCurrency(parseFloat(expense.deductibleAmount))
                      : formatCurrency(parseFloat(expense.amount))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 