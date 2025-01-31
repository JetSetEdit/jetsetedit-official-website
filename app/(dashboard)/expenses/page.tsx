import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, FileSpreadsheet, Receipt } from "lucide-react";
import Link from "next/link";
import { ExpensesTable } from "./expenses-table";
import { db } from "@/lib/db";
import { expenses } from "@/lib/db/schema/expenses";
import { formatCurrency, formatDate } from "@/lib/utils";
import { and, gte, lte } from "drizzle-orm";

async function getExpenseStats() {
  const currentDate = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const monthlyExpenses = await db
    .select()
    .from(expenses)
    .where(
      and(
        gte(expenses.date, firstDayOfMonth),
        lte(expenses.date, lastDayOfMonth)
      )
    );

  const pendingReceipts = monthlyExpenses.filter(
    (expense) => !expense.receiptUrl
  ).length;

  const totalAmount = monthlyExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  const deductibleAmount = monthlyExpenses
    .filter((expense) => expense.isDeductible)
    .reduce((sum, expense) => sum + Number(expense.amount), 0);

  return {
    totalAmount,
    pendingReceipts,
    deductibleAmount,
  };
}

async function getExpenses() {
  const results = await db.select().from(expenses);
  return results.map(expense => ({
    id: expense.id,
    date: formatDate(expense.date || new Date()),
    amount: expense.amount?.toString() || '0',
    description: expense.description || '',
    category: expense.category || '',
    status: expense.status || 'pending',
    isDeductible: expense.isDeductible || false,
    receiptUrl: expense.receiptUrl || null,
  }));
}

export default async function ExpensesPage() {
  const stats = await getExpenseStats();
  const expensesList = await getExpenses();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-sm text-muted-foreground">
            Track and manage your business expenses and deductions.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Link href="/expenses/new">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Expenses</TabsTrigger>
          <TabsTrigger value="receipts">Receipts</TabsTrigger>
          <TabsTrigger value="deductions">Tax Deductions</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total Expenses</CardTitle>
                <CardDescription>Current month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.totalAmount)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Pending Receipts</CardTitle>
                <CardDescription>Receipts to be processed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingReceipts}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Tax Deductions</CardTitle>
                <CardDescription>Potential deductions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.deductibleAmount)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
              <CardDescription>Your latest expenses and receipts.</CardDescription>
            </CardHeader>
            <CardContent>
              <ExpensesTable expenses={expensesList} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Receipt Management</CardTitle>
              <CardDescription>Upload and manage your receipts.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12">
                <Receipt className="h-8 w-8 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop your receipts here, or click to upload
                </p>
                <Button variant="secondary" size="sm">
                  Upload Receipt
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deductions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tax Deductions</CardTitle>
              <CardDescription>Track potential tax deductions.</CardDescription>
            </CardHeader>
            <CardContent>
              <ExpensesTable
                expenses={expensesList.filter((expense) => expense.isDeductible)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expense Reports</CardTitle>
              <CardDescription>Generate and view expense reports.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                No reports generated yet.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 