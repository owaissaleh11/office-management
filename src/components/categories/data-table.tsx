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
import { ArrowUpDown, ChevronDown, MoreHorizontal, Pencil, Trash } from "lucide-react";

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
import { deleteCategory } from "@/actions/categories";
import { toast } from "sonner";
import { CategoryDialog } from "./category-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CategoryForm } from "./category-form";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export type CategoryColumn = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  _count: { services: number };
};

export function DataTable({ data }: { data: CategoryColumn[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<CategoryColumn | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryColumn | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const columns: ColumnDef<CategoryColumn>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            اسم القسم
            <ArrowUpDown className="ms-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="font-medium px-4">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "description",
      header: "الوصف",
      cell: ({ row }) => {
        const desc = row.getValue("description") as string;
        return <div className="max-w-[300px] truncate">{desc || "—"}</div>;
      },
    },
    {
      accessorKey: "_count.services",
      id: "servicesCount",
      header: "عدد الخدمات",
      cell: ({ row }) => <div>{row.original._count.services} خدمة</div>,
    },
    {
      accessorKey: "isActive",
      header: "الحالة",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "نشط" : "غير نشط"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const category = row.original;

        const handleDelete = async () => {
          if (confirm(`هل أنت متأكد من حذف القسم "${category.name}"؟`)) {
            const res = await deleteCategory(category.id);
            if (res.success) {
              toast.success("تم حذف القسم بنجاح");
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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(category.id)}>
                نسخ المعرف
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSelectedCategoryForEdit(category)}>
                <Pencil className="me-2 h-4 w-4 text-muted-foreground" /> تعديل
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCategoryToDelete(category)} className="text-destructive focus:text-destructive">
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
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div className="w-full space-y-4">
      <Dialog open={!!selectedCategoryForEdit} onOpenChange={(open) => !open && setSelectedCategoryForEdit(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تعديل القسم</DialogTitle>
            <DialogDescription>
              قم بتعديل بيانات القسم المختار هنا. انقر على حفظ عند الانتهاء.
            </DialogDescription>
          </DialogHeader>
          {selectedCategoryForEdit && (
            <CategoryForm 
              defaultValues={{
                id: selectedCategoryForEdit.id,
                name: selectedCategoryForEdit.name,
                description: selectedCategoryForEdit.description || "",
                isActive: selectedCategoryForEdit.isActive,
              }}
              onSuccess={() => setSelectedCategoryForEdit(null)} 
            />
          )}
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between">
        <Input
          placeholder="ابحث عن قسم..."
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
                      {column.id === "name" ? "القسم" : column.id === "description" ? "الوصف" : column.id === "servicesCount" ? "عدد الخدمات" : column.id === "isActive" ? "الحالة" : column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <CategoryDialog />
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
                    title="لا يوجد أقسام" 
                    description="لم يتم إضافة أي أقسام حتى الآن، أو لا توجد نتائج مطابقة لبحثك."
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
          {table.getFilteredRowModel().rows.length} قسم(أقسام).
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
