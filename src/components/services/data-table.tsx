"use client";

import { useState } from "react";
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
import { ArrowUpDown, ChevronDown, MoreHorizontal, Plus, Pencil, Trash, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { deleteService } from "@/actions/services";
import { toast } from "sonner";
import { ServiceFormDialog } from "./service-form-dialog";
import { ServiceDetailsDialog } from "./service-details-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ServiceForm } from "./service-form";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { EmptyState } from "@/components/ui/empty-state";

export type ServiceColumn = {
  id: string;
  name: string;
  categoryId: string;
  category: { name: string };
  fees: number;
  status: string;
  createdAt: Date;
  description: string | null;
  documents: { id?: string; title: string; displayOrder: number }[];
  processingTime: string | null;
  notes: string | null;
  attachments: string | null;
};

export function DataTable({ data }: { data: ServiceColumn[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  
  const [selectedServiceForDetails, setSelectedServiceForDetails] = useState<ServiceColumn | null>(null);
  const [selectedServiceForEdit, setSelectedServiceForEdit] = useState<ServiceColumn | null>(null);

  const columns: ColumnDef<ServiceColumn>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            الخدمة
            <ArrowUpDown className="ms-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="font-medium px-4">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "category.name",
      id: "category",
      header: "القسم",
      cell: ({ row }) => <div>{row.original.category?.name || "—"}</div>,
    },
    {
      accessorKey: "fees",
      header: "الرسوم",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("fees"));
        const formatted = new Intl.NumberFormat("ar-JO", {
          style: "currency",
          currency: "JOD",
        }).format(amount);
        return <div>{formatted}</div>;
      },
    },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge
            variant={status === "ACTIVE" ? "default" : status === "INACTIVE" ? "secondary" : "destructive"}
          >
            {status === "ACTIVE" ? "نشط" : status === "INACTIVE" ? "غير نشط" : "مؤرشف"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const service = row.original;

        const handleDelete = async () => {
          if (confirm("هل أنت متأكد من حذف هذه الخدمة؟")) {
            const res = await deleteService(service.id);
            if (res.success) {
              toast.success("تم حذف الخدمة بنجاح");
            } else {
              toast.error(res.error);
            }
          }
        };

        return (
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">فتح القائمة</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            } />
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(service.id)}>
                نسخ المعرف
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSelectedServiceForDetails(service)}>
                <Eye className="me-2 h-4 w-4 text-muted-foreground" /> عرض التفاصيل
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedServiceForEdit(service)}>
                <Pencil className="me-2 h-4 w-4 text-muted-foreground" /> تعديل
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                <Trash className="me-2 h-4 w-4" /> حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

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
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full space-y-4">
      {/* Dialogs */}
      <ServiceDetailsDialog 
        service={selectedServiceForDetails} 
        open={!!selectedServiceForDetails} 
        onOpenChange={(open) => !open && setSelectedServiceForDetails(null)} 
      />

      <Dialog open={!!selectedServiceForEdit} onOpenChange={(open) => !open && setSelectedServiceForEdit(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل الخدمة</DialogTitle>
            <DialogDescription>قم بتحديث تفاصيل الخدمة واضغط حفظ</DialogDescription>
          </DialogHeader>
          {selectedServiceForEdit && (
            <ServiceForm 
              defaultValues={{
                id: selectedServiceForEdit.id,
                name: selectedServiceForEdit.name,
                categoryId: selectedServiceForEdit.categoryId,
                description: selectedServiceForEdit.description || "",
                documents: selectedServiceForEdit.documents || [],
                processingTime: selectedServiceForEdit.processingTime || "",
                fees: selectedServiceForEdit.fees,
                notes: selectedServiceForEdit.notes || "",
                status: selectedServiceForEdit.status as "ACTIVE" | "INACTIVE" | "ARCHIVED",
              }}
              onSuccess={() => setSelectedServiceForEdit(null)} 
            />
          )}
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between">
        <Input
          placeholder="ابحث عن خدمة..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="outline" className="ms-auto">
                الأعمدة <ChevronDown className="ms-2 h-4 w-4" />
              </Button>
            } />
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id === "name" ? "الخدمة" : column.id === "category" ? "القسم" : column.id === "fees" ? "الرسوم" : column.id === "status" ? "الحالة" : column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <ServiceFormDialog />
        </div>
      </div>
      <div className="rounded-md border">
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
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center p-0">
                  <EmptyState 
                    title="لا يوجد خدمات" 
                    description="لم يتم إضافة أي خدمات حتى الآن، أو لا توجد نتائج مطابقة لبحثك."
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
          عرض {table.getRowModel().rows.length} من أصل{" "}
          {table.getFilteredRowModel().rows.length} خدمة(خدمات).
        </div>
        <div className="space-x-2 space-x-reverse flex">
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
