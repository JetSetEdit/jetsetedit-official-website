import { NextResponse } from 'next/server';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { S3Client } from '@aws-sdk/client-s3';

// Initialize S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('receipt') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Generate a unique key for the file
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const key = `receipts/${timestamp}-${file.name}`;

    // Get presigned URL for S3 upload
    const { url, fields } = await createPresignedPost(s3, {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      Conditions: [
        ['content-length-range', 0, 10485760], // Max 10MB
      ],
      Expires: 600, // URL expires in 10 minutes
    });

    return NextResponse.json({
      uploadUrl: url,
      uploadFields: {
        ...fields,
        'Content-Type': file.type,
      },
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}