"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Expense } from "@/lib/db/schema/expenses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const expenseFormSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  date: z.string().min(1, "Date is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  vendorName: z.string().optional(),
  vendorTaxId: z.string().optional(),
  
  // Tax tracking
  isDeductible: z.boolean(),
  deductionCategory: z.string().optional(),
  taxYear: z.string().optional(),
  jurisdiction: z.string().optional(),
  deductibleAmount: z.string().optional(),
  deductionPercentage: z.string().optional(),
  
  // Split transaction
  isSplitExpense: z.boolean().default(false),
  splitPercentage: z.string().optional(),
  
  // Notes and compliance
  notes: z.string().optional(),
  complianceNotes: z.string().optional(),
  needsReceipt: z.boolean().default(true),
  receiptUrl: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

const expenseCategories = [
  "office_supplies",
  "travel",
  "meals_entertainment",
  "equipment",
  "software_subscriptions",
  "utilities",
  "rent_lease",
  "marketing_advertising",
  "professional_services",
  "vehicle_expenses",
  "insurance",
  "training_education",
  "maintenance_repairs",
  "bank_fees",
  "office_expenses",
  "telecommunications",
  "employee_benefits",
  "other",
] as const;

const deductionCategories = [
  "home_office",
  "vehicle_business",
  "travel_domestic",
  "travel_international",
  "meals_entertainment_50",
  "meals_entertainment_100",
  "education_training",
  "insurance_business",
  "equipment_section_179",
  "depreciation",
  "professional_services",
  "marketing",
  "software_saas",
  "research_development",
  "other",
] as const;

const jurisdictions = ["federal", "state", "local"] as const;

interface ExpenseFormProps {
  action: (formData: FormData) => Promise<void>;
  expense?: Expense;
}

export function ExpenseForm({ action, expense }: ExpenseFormProps) {
  const [isPending, startTransition] = useTransition();
  const currentYear = new Date().getFullYear();
  const taxYears = Array.from({ length: 3 }, (_, i) => currentYear - i);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      amount: expense?.amount?.toString() || "",
      date: expense?.date ? new Date(expense.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      description: expense?.description || "",
      category: expense?.category || "",
      vendorName: expense?.vendorName || "",
      vendorTaxId: expense?.vendorTaxId || "",
      isDeductible: expense?.isDeductible || false,
      deductionCategory: expense?.deductionCategory || "",
      taxYear: expense?.taxYear?.toString() || currentYear.toString(),
      jurisdiction: expense?.jurisdiction || "",
      deductibleAmount: expense?.deductibleAmount?.toString() || "",
      deductionPercentage: expense?.deductionPercentage?.toString() || "",
      isSplitExpense: !!expense?.parentExpenseId,
      splitPercentage: expense?.splitPercentage?.toString() || "",
      notes: expense?.notes || "",
      complianceNotes: expense?.complianceNotes || "",
      needsReceipt: expense?.needsReceipt ?? true,
      receiptUrl: expense?.receiptUrl || "",
    },
  });

  async function onSubmit(data: ExpenseFormValues) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    
    startTransition(() => action(formData));
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {expenseCategories.map((category) => (
                        <SelectItem
                          key={category}
                          value={category}
                          className="capitalize"
                        >
                          {category.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="vendorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vendorTaxId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor Tax ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tax Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="isDeductible"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Tax Deductible</FormLabel>
                    <FormDescription>
                      Is this expense tax deductible?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("isDeductible") && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="taxYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax Year</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select tax year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {taxYears.map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="jurisdiction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax Jurisdiction</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select jurisdiction" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {jurisdictions.map((jurisdiction) => (
                              <SelectItem
                                key={jurisdiction}
                                value={jurisdiction}
                                className="capitalize"
                              >
                                {jurisdiction}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="deductionCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deduction Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {deductionCategories.map((category) => (
                            <SelectItem
                              key={category}
                              value={category}
                              className="capitalize"
                            >
                              {category.replace(/_/g, " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="deductibleAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deductible Amount</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deductionPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deduction Percentage</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="100" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Split Transaction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="isSplitExpense"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Split Expense</FormLabel>
                    <FormDescription>
                      Is this a split transaction?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("isSplitExpense") && (
              <FormField
                control={form.control}
                name="splitPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Split Percentage</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="100" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes & Compliance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any general notes about the expense..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="complianceNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Compliance Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any compliance-related notes..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="needsReceipt"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Receipt Required</FormLabel>
                    <FormDescription>
                      Is a receipt required for this expense?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Button type="submit" disabled={isPending}>
          {expense ? "Update Expense" : "Create Expense"}
        </Button>
      </form>
    </Form>
  );
}