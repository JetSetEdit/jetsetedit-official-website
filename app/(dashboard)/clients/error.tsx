'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Something went wrong!</CardTitle>
        <CardDescription>
          An error occurred while loading the clients.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {error.message || 'Please try again later.'}
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={reset}>Try again</Button>
      </CardFooter>
    </Card>
  );
} 