import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Receipt, Pencil, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { expenses } from "@/lib/db/schema/expenses";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { revalidatePath } from "next/cache";

async function deleteExpense(id: number) {
  "use server";
  
  await db.delete(expenses).where(eq(expenses.id, id));
  revalidatePath("/expenses");
  redirect("/expenses");
}

export default async function ExpenseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [expense] = await db
    .select()
    .from(expenses)
    .where(eq(expenses.id, parseInt(params.id)));

  if (!expense) {
    notFound();
  }

  // Ensure date is properly formatted
  const expenseDate = expense.date ? new Date(expense.date) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/expenses">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Expense Details</h1>
            <p className="text-sm text-muted-foreground">
              View and manage expense information.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/expenses/${params.id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <form action={async () => {
            "use server";
            await deleteExpense(parseInt(params.id));
          }}>
            <Button variant="destructive" size="sm" type="submit">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </form>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Details about this expense.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Amount</div>
              <div className="text-2xl font-bold">{formatCurrency(Number(expense.amount))}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Date</div>
              <div>{expenseDate ? formatDate(expenseDate) : 'No date'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Description</div>
              <div>{expense.description}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Category</div>
              <Badge variant="secondary" className="capitalize">
                {expense.category.replace('_', ' ')}
              </Badge>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Status</div>
              <Badge>{expense.status}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tax Information</CardTitle>
            <CardDescription>Tax deduction details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Tax Deductible</div>
              <div>
                {expense.isDeductible ? (
                  <Badge variant="default">Yes</Badge>
                ) : (
                  <Badge variant="secondary">No</Badge>
                )}
              </div>
            </div>
            {expense.isDeductible && (
              <>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Deduction Category</div>
                  <div className="capitalize">{expense.deductionCategory?.replace('_', ' ')}</div>
                </div>
                {expense.notes && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Notes</div>
                    <div className="text-sm">{expense.notes}</div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {expense.receiptUrl && (
          <Card>
            <CardHeader>
              <CardTitle>Receipt</CardTitle>
              <CardDescription>View or download the receipt.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Receipt className="h-8 w-8 text-muted-foreground" />
                <Button
                  variant="outline"
                  onClick={() => window.open(expense.receiptUrl!, '_blank')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Receipt
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 