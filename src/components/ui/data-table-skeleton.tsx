import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableSkeletonProps {
  columnCount: number;
  rowCount?: number;
  searchableColumnCount?: number;
  filterableColumnCount?: number;
}

export function DataTableSkeleton({
  columnCount,
  rowCount = 5,
  searchableColumnCount = 1,
  filterableColumnCount = 0,
}: DataTableSkeletonProps) {
  return (
    <div className="w-full space-y-4 animate-in fade-in-50 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2 space-x-reverse">
          {Array.from({ length: searchableColumnCount }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-[250px]" />
          ))}
          {Array.from({ length: filterableColumnCount }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-[100px]" />
          ))}
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          <Skeleton className="h-10 w-[100px]" />
        </div>
      </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: columnCount }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-6 w-full" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: columnCount }).map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 space-x-reverse py-4">
        <Skeleton className="h-8 w-[100px]" />
        <div className="space-x-2 space-x-reverse flex">
          <Skeleton className="h-8 w-[80px]" />
          <Skeleton className="h-8 w-[80px]" />
        </div>
      </div>
    </div>
  );
}
