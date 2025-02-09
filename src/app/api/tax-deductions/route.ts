import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Define tax deduction categories
export const TAX_CATEGORIES = {
  EQUIPMENT: 'Equipment',
  SOFTWARE: 'Software',
  OFFICE_SUPPLIES: 'Office Supplies',
  TRAVEL: 'Travel',
  UTILITIES: 'Utilities',
  PROFESSIONAL_SERVICES: 'Professional Services',
  MARKETING: 'Marketing',
  TRAINING: 'Training',
  OTHER: 'Other'
} as const;

// In-memory storage for development (replace with database in production)
let deductions: any[] = [];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    return new NextResponse(
      JSON.stringify(deductions),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error fetching tax deductions:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to fetch tax deductions',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const body = await request.json();
    const { date, category, description, amount, receiptUrl } = body;

    if (!date || !category || !description || !amount) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400 }
      );
    }

    const newDeduction = {
      id: Date.now().toString(),
      date,
      category,
      description,
      amount: parseFloat(amount),
      receiptUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    deductions.push(newDeduction);

    return new NextResponse(
      JSON.stringify(newDeduction),
      { 
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error creating tax deduction:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to create tax deduction',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, date, category, description, amount, receiptUrl } = body;

    if (!id || !date || !category || !description || !amount) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400 }
      );
    }

    const index = deductions.findIndex(d => d.id === id);
    if (index === -1) {
      return new NextResponse(
        JSON.stringify({ error: 'Deduction not found' }),
        { status: 404 }
      );
    }

    const updatedDeduction = {
      ...deductions[index],
      date,
      category,
      description,
      amount: parseFloat(amount),
      receiptUrl,
      updatedAt: new Date().toISOString()
    };

    deductions[index] = updatedDeduction;

    return new NextResponse(
      JSON.stringify(updatedDeduction),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error updating tax deduction:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to update tax deduction',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse(
        JSON.stringify({ error: 'Deduction ID is required' }),
        { status: 400 }
      );
    }

    const index = deductions.findIndex(d => d.id === id);
    if (index === -1) {
      return new NextResponse(
        JSON.stringify({ error: 'Deduction not found' }),
        { status: 404 }
      );
    }

    deductions.splice(index, 1);

    return new NextResponse(
      JSON.stringify({ success: true }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error deleting tax deduction:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to delete tax deduction',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { status: 500 }
    );
  }
} 