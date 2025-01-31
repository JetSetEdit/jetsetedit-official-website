import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';

// Check for required environment variables
const requiredEnvVars = [
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'AWS_BUCKET_NAME',
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Initialize S3 client
export const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const BUCKET_NAME = process.env.AWS_BUCKET_NAME!;

interface UploadParams {
  fileName: string;
  fileType?: string;
  maxSizeInBytes?: number;
}

/**
 * Creates a presigned URL for uploading a file to S3
 */
export async function createPresignedUploadUrl({
  fileName,
  fileType,
  maxSizeInBytes = 10 * 1024 * 1024, // 10MB default
}: UploadParams) {
  try {
    const key = `receipts/${fileName}`;
    
    const conditions = [];
    
    // Add content length condition
    conditions.push(['content-length-range', 0, maxSizeInBytes]);
    
    // Add content type condition if specified
    if (fileType) {
      conditions.push(['eq', '$Content-Type', fileType]);
    }

    const { url, fields } = await createPresignedPost(s3, {
      Bucket: BUCKET_NAME,
      Key: key,
      Conditions: conditions,
      Expires: 600, // URL expires in 10 minutes
    });

    return {
      url,
      fields,
      key,
    };
  } catch (error) {
    console.error('Error creating presigned URL:', error);
    throw new Error('Failed to create upload URL');
  }
}

/**
 * Gets the public URL for a file in S3
 */
export function getPublicUrl(key: string) {
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
} 