import { createPresignedUploadUrl } from '@/lib/s3';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { fileName, fileType } = await request.json();

    if (!fileName) {
      return NextResponse.json(
        { error: 'fileName is required' },
        { status: 400 }
      );
    }

    const { url, fields, key } = await createPresignedUploadUrl({
      fileName,
      fileType,
    });

    return NextResponse.json({ url, fields, key });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
} 