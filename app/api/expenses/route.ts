import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { expenses, receipts, expenseCategoryEnum } from '@/lib/db/schema/expenses';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { S3Client } from '@aws-sdk/client-s3';
import { createWorker } from 'tesseract.js';
import { eq, and, gte, lte } from 'drizzle-orm';

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Create the expense record
    const [expense] = await db.insert(expenses).values({
      amount: data.amount,
      date: new Date(data.date),
      description: data.description,
      category: data.category,
      isDeductible: data.isDeductible,
      deductionCategory: data.deductionCategory,
      notes: data.notes,
      receiptUrl: data.receiptUrl,
    }).returning();

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isDeductible = searchParams.get('isDeductible');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let conditions = [];

    if (category && expenseCategoryEnum.enumValues.includes(category as any)) {
      conditions.push(eq(expenses.category, category as typeof expenseCategoryEnum.enumValues[number]));
    }
    if (isDeductible) {
      conditions.push(eq(expenses.isDeductible, isDeductible === 'true'));
    }
    if (startDate) {
      conditions.push(gte(expenses.date, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte(expenses.date, new Date(endDate)));
    }

    const results = await db
      .select()
      .from(expenses)
      .where(and(...conditions));

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
} 