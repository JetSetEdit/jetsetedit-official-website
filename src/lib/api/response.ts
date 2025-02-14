import { NextResponse } from 'next/server';

interface ErrorResponse {
  error: string;
  details?: string;
}

export function handleApiError(error: unknown, message: string): NextResponse<ErrorResponse> {
  console.error(`${message}:`, error);
  
  return new NextResponse(
    JSON.stringify({
      error: message,
      details: process.env.NODE_ENV === 'development' 
        ? error instanceof Error ? error.message : 'Unknown error' 
        : undefined
    }),
    { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );
}

export function createApiResponse<T>(data: T, status = 200): NextResponse<T> {
  return new NextResponse(
    JSON.stringify(data),
    { 
      status,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );
} 