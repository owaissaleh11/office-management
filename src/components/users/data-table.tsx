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
import { ArrowUpDown, ChevronDown, MoreHorizontal, Pencil, KeyRound, Power, PowerOff, Plus, Trash2 } from "lucide-react";

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
import { EmptyState } from "@/components/ui/empty-state";
import { toggleUserStatus, deleteUser } from "@/actions/users";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { UserForm } from "./user-form";
import { ResetPasswordDialog } from "./reset-password-dialog";

export type UserColumn = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
};

export function DataTable({ data }: { data: UserColumn[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserColumn | null>(null);
  const [selectedUserForPasswordReset, setSelectedUserForPasswordReset] = useState<UserColumn | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const columns: ColumnDef<UserColumn>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            الاسم
            <ArrowUpDown className="ms-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="font-medium px-4">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "email",
      header: "البريد الإلكتروني",
      cell: ({ row }) => <div dir="ltr" className="text-right">{row.getValue("email")}</div>,
    },

    {
      accessorKey: "isActive",
      header: "الحالة",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <Badge variant={isActive ? "default" : "destructive"}>
            {isActive ? "نشط" : "غير نشط"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original;

        const handleToggleStatus = async () => {
          if (confirm(`هل أنت متأكد من ${user.isActive ? "إيقاف" : "تفعيل"} هذا المستخدم؟`)) {
            const res = await toggleUserStatus(user.id, user.isActive);
            if (res.success) {
              toast.success(`تم ${user.isActive ? "إيقاف" : "تفعيل"} المستخدم بنجاح`);
            } else {
              toast.error(res.error);
            }
          }
        };

        const handleDelete = async () => {
          if (!confirm(`هل أنت متأكد من حذف المستخدم "${user.name}" نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`)) return;
          setDeletingId(user.id);
          const res = await deleteUser(user.id);
          if (res.success) {
            toast.success("تم حذف المستخدم بنجاح");
          } else {
            toast.error(res.error);
          }
          setDeletingId(null);
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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
                نسخ المعرف
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSelectedUserForEdit(user)}>
                <Pencil className="me-2 h-4 w-4 text-muted-foreground" /> تعديل
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedUserForPasswordReset(user)}>
                <KeyRound className="me-2 h-4 w-4 text-muted-foreground" /> إعادة تعيين كلمة المرور
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleStatus} className={user.isActive ? "text-destructive focus:text-destructive" : ""}>
                {user.isActive ? (
                  <><PowerOff className="me-2 h-4 w-4" /> إيقاف الحساب</>
                ) : (
                  <><Power className="me-2 h-4 w-4 text-green-600" /> <span className="text-green-600">تفعيل الحساب</span></>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={deletingId === user.id}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="me-2 h-4 w-4" />
                {deletingId === user.id ? "جاري الحذف..." : "حذف الحساب نهائياً"}
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
      {/* Edit User Dialog */}
      <Dialog open={!!selectedUserForEdit} onOpenChange={(open) => !open && setSelectedUserForEdit(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>تعديل بيانات المستخدم</DialogTitle>
            <DialogDescription>قم بتحديث بيانات المستخدم واضغط حفظ</DialogDescription>
          </DialogHeader>
          {selectedUserForEdit && (
            <UserForm 
              defaultValues={{
                id: selectedUserForEdit.id,
                name: selectedUserForEdit.name,
                email: selectedUserForEdit.email,
                isActive: selectedUserForEdit.isActive,
              }}
              onSuccess={() => setSelectedUserForEdit(null)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      {selectedUserForPasswordReset && (
        <ResetPasswordDialog
          userId={selectedUserForPasswordReset.id}
          userName={selectedUserForPasswordReset.name}
          open={!!selectedUserForPasswordReset}
          onOpenChange={(open) => !open && setSelectedUserForPasswordReset(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <Input
          placeholder="ابحث عن مستخدم..."
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
                      {column.id === "name" ? "الاسم" : column.id === "email" ? "البريد الإلكتروني" : column.id === "isActive" ? "الحالة" : column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add User Dialog Trigger */}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger render={
              <Button>
                <Plus className="me-2 h-4 w-4" /> إضافة مستخدم
              </Button>
            } />
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                <DialogDescription>
                  أدخل تفاصيل المستخدم الجديد لإنشاء حسابه.
                </DialogDescription>
              </DialogHeader>
              <UserForm onSuccess={() => setIsAddOpen(false)} />
            </DialogContent>
          </Dialog>
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
                    title="لا يوجد مستخدمين" 
                    description="لم يتم إضافة أي مستخدمين حتى الآن، أو لا توجد نتائج مطابقة لبحثك."
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
          {table.getFilteredRowModel().rows.length} مستخدم.
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
