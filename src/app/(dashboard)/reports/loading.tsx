import { DataTableSkeleton } from "@/components/ui/data-table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsLoading() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <Skeleton className="h-10 w-[200px] mb-2" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
      </div>
      <div className="flex flex-col space-y-8 mt-4">
        <DataTableSkeleton columnCount={5} rowCount={10} />
      </div>
    </div>
  );
}
