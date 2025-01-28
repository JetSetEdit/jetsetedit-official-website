import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';

export function EmptyState() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No clients found</CardTitle>
        <CardDescription>
          Get started by creating your first client.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex min-h-[300px] items-center justify-center">
        <div className="text-center">
          <PlusCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-sm text-muted-foreground">
            You haven't added any clients yet.
          </p>
        </div>
      </CardContent>
      <CardFooter className="justify-center">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </CardFooter>
    </Card>
  );
} 