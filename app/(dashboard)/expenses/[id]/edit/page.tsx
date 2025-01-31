import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { expenses } from "@/lib/db/schema/expenses";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { ExpenseForm } from "@/components/expense-form";
import { revalidatePath } from "next/cache";

async function updateExpense(id: number, formData: FormData) {
  "use server";

  const amount = formData.get("amount");
  const date = formData.get("date");
  const description = formData.get("description");
  const category = formData.get("category");
  const isDeductible = formData.get("isDeductible") === "true";
  const deductionCategory = formData.get("deductionCategory");
  const notes = formData.get("notes");
  const receiptUrl = formData.get("receiptUrl");

  await db
    .update(expenses)
    .set({
      amount: amount ? parseFloat(amount.toString()) : undefined,
      date: date ? new Date(date.toString()) : undefined,
      description: description?.toString(),
      category: category?.toString(),
      isDeductible,
      deductionCategory: deductionCategory?.toString(),
      notes: notes?.toString(),
      receiptUrl: receiptUrl?.toString(),
      updatedAt: new Date(),
    })
    .where(eq(expenses.id, id));

  revalidatePath("/expenses");
  redirect(`/expenses/${id}`);
}

export default async function EditExpensePage({
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/expenses/${params.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Expense</h1>
          <p className="text-sm text-muted-foreground">
            Update expense information.
          </p>
        </div>
      </div>

      <ExpenseForm
        action={async (formData: FormData) => {
          "use server";
          await updateExpense(parseInt(params.id), formData);
        }}
        expense={expense}
      />
    </div>
  );
} 