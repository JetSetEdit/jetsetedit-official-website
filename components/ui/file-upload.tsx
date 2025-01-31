'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/ui/icons';

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  onError?: (error: Error) => void;
}

export function FileUpload({ onUploadComplete, onError }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
  }

  async function handleUpload() {
    if (!file) return;

    try {
      setIsUploading(true);

      // Get presigned URL
      const response = await fetch('/api/upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { url, fields, key } = await response.json();

      // Create form data for upload
      const formData = new FormData();
      Object.entries(fields).forEach(([field, value]) => {
        formData.append(field, value as string);
      });
      formData.append('file', file);

      // Upload to S3
      const uploadResponse = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      // Get the public URL
      const publicUrl = `https://${fields.bucket}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`;
      onUploadComplete(publicUrl);
    } catch (error) {
      console.error('Upload error:', error);
      onError?.(error as Error);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      {file && (
        <Button
          onClick={handleUpload}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            'Upload Receipt'
          )}
        </Button>
      )}
    </div>
  );
} 