"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Eye, Pencil, Trash2, MoreHorizontal, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CaseStatusBadge } from "./case-status-badge";
import { CasePriorityBadge } from "./case-priority-badge";
import { deleteCase } from "@/actions/cases";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { FolderOpen } from "lucide-react";

interface CaseRow {
  id: string;
  caseNumber: string;
  status: string;
  priority: string;
  fees: number;
  amountPaid: number;
  remainingBalance: number;
  createdAt: Date;
  updatedAt: Date;
  client: { fullName: string; phone: string };
  service: { name: string };
}

export function CasesTable({ cases }: { cases: CaseRow[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, caseNumber: string) => {
    if (!confirm(`هل أنت متأكد من حذف المعاملة رقم ${caseNumber}؟`)) return;
    setDeletingId(id);
    const res = await deleteCase(id);
    if (res.success) {
      toast.success("تم حذف المعاملة بنجاح");
    } else {
      toast.error(res.error);
    }
    setDeletingId(null);
  };

  if (cases.length === 0) {
    return (
      <EmptyState
        title="لا توجد معاملات"
        description="لم يتم إنشاء أي معاملات بعد، أو لا توجد نتائج مطابقة لبحثك."
        icon={FolderOpen}
      />
    );
  }

  return (
    <div className="rounded-xl border overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead className="text-right">رقم المعاملة</TableHead>
            <TableHead className="text-right">العميل</TableHead>
            <TableHead className="text-right">الخدمة</TableHead>
            <TableHead className="text-right">رقم الهاتف</TableHead>
            <TableHead className="text-right">الحالة</TableHead>
            <TableHead className="text-right">الأولوية</TableHead>
            <TableHead className="text-right">المتبقي</TableHead>
            <TableHead className="text-right">التاريخ</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.map(c => (
            <TableRow key={c.id} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-mono font-semibold text-primary">
                <Link href={`/cases/${c.id}`} className="hover:underline">{c.caseNumber}</Link>
              </TableCell>
              <TableCell className="font-medium">{c.client.fullName}</TableCell>
              <TableCell className="text-muted-foreground text-sm">{c.service.name}</TableCell>
              <TableCell className="text-muted-foreground text-sm">{c.client.phone}</TableCell>
              <TableCell><CaseStatusBadge status={c.status} /></TableCell>
              <TableCell><CasePriorityBadge priority={c.priority} /></TableCell>
              <TableCell className={c.remainingBalance > 0 ? "text-amber-600 font-semibold" : "text-green-600 font-semibold"}>
                {c.remainingBalance.toFixed(2)} د
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {format(new Date(c.createdAt), "dd/MM/yyyy", { locale: ar })}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger render={
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  } />
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/cases/${c.id}`)}>
                      <Eye className="me-2 h-4 w-4" /> عرض التفاصيل
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/cases/${c.id}/edit`)}>
                      <Pencil className="me-2 h-4 w-4" /> تعديل
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.open(`/cases/${c.id}/print`, "_blank")}>
                      <Printer className="me-2 h-4 w-4" /> طباعة
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDelete(c.id, c.caseNumber)}
                      disabled={deletingId === c.id}
                    >
                      <Trash2 className="me-2 h-4 w-4" /> حذف
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
