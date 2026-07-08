"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export type ActivityData = {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  action: string;
  target: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: Date;
};

export const columns: ColumnDef<ActivityData>[] = [
  {
    accessorKey: "user.name",
    header: "المستخدم",
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{user.name}</span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "action",
    header: "النشاط",
    cell: ({ row }) => {
      const action = row.getValue("action") as string;
      let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
      if (action.includes("حذف") || action.includes("إيقاف")) variant = "destructive";
      else if (action.includes("إضافة") || action.includes("تسجيل الدخول")) variant = "default";
      else if (action.includes("تعديل") || action.includes("إعادة تعيين")) variant = "secondary";
      
      return <Badge variant={variant}>{action}</Badge>;
    },
  },
  {
    accessorKey: "target",
    header: "التفاصيل",
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate" title={row.original.target || ""}>
        {row.original.target || "-"}
      </div>
    ),
  },
  {
    accessorKey: "ipAddress",
    header: "عنوان IP",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.ipAddress || "Unknown"}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "التاريخ والوقت",
    cell: ({ row }) => {
      return (
        <span className="text-sm">
          {format(new Date(row.original.createdAt), "dd MMMM yyyy, hh:mm a", { locale: ar })}
        </span>
      );
    },
  },
];

interface DataTableProps {
  data: ActivityData[];
}

export function DataTable({ data }: DataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="ابحث حسب النشاط..."
          value={(table.getColumn("action")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("action")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center p-0">
                  <EmptyState 
                    title="لا توجد نشاطات" 
                    description="لم يتم تسجيل أي نشاطات في النظام حتى الآن، أو لا توجد نتائج مطابقة لبحثك."
                    className="border-0 rounded-none bg-transparent"
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 space-x-reverse py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          إجمالي السجلات: {table.getFilteredRowModel().rows.length}
        </div>
        <div className="space-x-2 space-x-reverse">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            السابق
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            التالي
          </Button>
        </div>
      </div>
    </div>
  );
}
