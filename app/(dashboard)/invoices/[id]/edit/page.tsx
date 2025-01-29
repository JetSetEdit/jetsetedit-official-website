import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { invoices, invoiceItems } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { EditInvoiceForm } from './edit-form';

interface Props {
  params: {
    id: string;
  };
}

async function getInvoiceById(id: number) {
  const [result] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.id, id));

  if (!result) return null;

  const items = await db
    .select()
    .from(invoiceItems)
    .where(eq(invoiceItems.invoiceId, id));

  return {
    ...result,
    items: items.map(item => ({
      id: item.id,
      description: item.description,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      amount: Number(item.amount)
    }))
  };
}

export default async function EditInvoicePage({ params }: Props) {
  const invoiceData = await getInvoiceById(Number(params.id));

  if (!invoiceData) {
    notFound();
  }

  return <EditInvoiceForm invoice={invoiceData} />;
} 