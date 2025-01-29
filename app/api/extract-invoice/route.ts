import { NextResponse } from 'next/server';
import { getDocument } from '@/lib/pdf-config';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Convert File to ArrayBuffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const data = new Uint8Array(buffer);
    
    try {
      const pdf = await getDocument(data);
      const page = await pdf.getPage(1);
      const textContent = await page.getTextContent();
      const text = textContent.items.map((item: any) => item.str).join(' ');

      console.log('Extracted text:', text);

      // Extract invoice data using regex patterns
      const invoiceData = {
        invoiceNumber: extractInvoiceNumber(text),
        issueDate: extractDate(text, 'issue'),
        dueDate: extractDate(text, 'due'),
        items: extractItems(text),
        taxRate: extractTaxRate(text),
        notes: extractNotes(text),
        terms: extractTerms(text)
      };

      console.log('Extracted data:', invoiceData);

      return NextResponse.json(invoiceData);
    } catch (pdfError) {
      console.error('PDF processing error:', pdfError);
      return NextResponse.json(
        { error: 'Failed to read PDF content. Please ensure the file is not corrupted.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Request handling error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    );
  }
}

function extractInvoiceNumber(text: string): string {
  const match = text.match(/Invoice\s*#?\s*:\s*([A-Z]+\d+)/i);
  return match?.[1] || '';
}

function extractDate(text: string, type: 'issue' | 'due'): string {
  // Look for dates in various formats including month names
  const monthNames = '(?:January|February|March|April|May|June|July|August|September|October|November|December)';
  const datePattern = type === 'issue'
    ? new RegExp(`(${monthNames}\\s+\\d{1,2},?\\s+\\d{4})`, 'i')
    : /Due\s*:\s*(\w+\s+\d{1,2},?\s+\d{4})/i;
  
  const match = text.match(datePattern);
  if (!match?.[1]) return '';

  // Convert to YYYY-MM-DD format
  const date = new Date(match[1]);
  return date.toISOString().split('T')[0];
}

function extractItems(text: string): any[] {
  const items = [];
  // Split text into lines for better item parsing
  const lines = text.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Look for lines with price patterns
    const priceMatch = line.match(/\$(\d+\.\d{2})\s+(\d+\.?\d*)\s+\$(\d+\.\d{2})/);
    if (priceMatch) {
      // Get description from previous line
      const description = lines[i - 1]?.trim() || '';
      if (description && !description.includes('Total') && !description.includes('Amount Due')) {
        items.push({
          description,
          quantity: parseFloat(priceMatch[2]),
          unitPrice: parseFloat(priceMatch[1]),
          amount: parseFloat(priceMatch[3])
        });
      }
    }
  }

  return items;
}

function extractTaxRate(text: string): number {
  // Default to 10% GST if not specified
  return 10;
}

function extractNotes(text: string): string {
  const match = text.match(/Notes\s+(.*?)(?=Terms|$)/is);
  return match?.[1]?.trim() || '';
}

function extractTerms(text: string): string {
  const match = text.match(/Terms\s+(.*?)(?=Notes|$)/is);
  return match?.[1]?.trim() || '';
} 