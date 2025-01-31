import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Receipt, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  onUploadError: (error: Error) => void;
  accept?: string;
  maxSize?: number;
}

export function FileUpload({
  onUploadComplete,
  onUploadError,
  accept = "image/*,.pdf",
  maxSize = 10 * 1024 * 1024, // 10MB default
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsUploading(true);

    try {
      // Create FormData with the file and expense data
      const formData = new FormData();
      formData.append('receipt', file);

      // Get the presigned URL from your API
      const response = await fetch('/api/expenses/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, uploadFields } = await response.json();

      // Create a new FormData for the S3 upload
      const s3FormData = new FormData();
      Object.entries(uploadFields).forEach(([key, value]) => {
        s3FormData.append(key, value as string);
      });
      s3FormData.append('file', file);

      // Upload to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: s3FormData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      // Construct the final URL
      const fileUrl = `${uploadUrl}/${uploadFields.key}`;
      onUploadComplete(fileUrl);
    } catch (error) {
      onUploadError(error instanceof Error ? error : new Error('Upload failed'));
    } finally {
      setIsUploading(false);
    }
  }, [onUploadComplete, onUploadError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.split(',').reduce((acc, curr) => {
      acc[curr.trim()] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 transition-colors",
        isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
        "hover:border-primary hover:bg-primary/5 cursor-pointer"
      )}
    >
      <input {...getInputProps()} />
      <Receipt className="h-8 w-8 text-muted-foreground mb-4" />
      <p className="text-sm text-muted-foreground mb-2">
        {isDragActive
          ? "Drop the file here"
          : "Drag and drop your receipt here, or click to upload"}
      </p>
      <Button variant="secondary" size="sm" disabled={isUploading}>
        <Upload className="mr-2 h-4 w-4" />
        {isUploading ? "Uploading..." : "Upload Receipt"}
      </Button>
    </div>
  );
} 