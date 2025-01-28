import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Loading() {
  return (
    <div>
      <div className="flex items-center space-x-4 pb-4">
        <div className="space-x-2">
          <Skeleton className="h-8 w-[60px] rounded-md" />
          <Skeleton className="h-8 w-[60px] rounded-md" />
          <Skeleton className="h-8 w-[60px] rounded-md" />
          <Skeleton className="h-8 w-[60px] rounded-md" />
          <Skeleton className="h-8 w-[60px] rounded-md" />
        </div>
        <div className="ml-auto space-x-2">
          <Skeleton className="h-8 w-[60px] rounded-md" />
          <Skeleton className="h-8 w-[60px] rounded-md" />
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-[120px]" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-[250px]" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead className="hidden md:table-cell">Last Project</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-[120px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[60px]" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-[150px]" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-center justify-between">
            <Skeleton className="h-4 w-[200px]" />
            <div className="space-x-2">
              <Skeleton className="h-8 w-[60px] rounded-md" />
              <Skeleton className="h-8 w-[60px] rounded-md" />
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 