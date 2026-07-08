"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { caseStatuses, casePriorities, caseStatusLabels, casePriorityLabels } from "@/lib/validations/case";
import { updateCase } from "@/actions/cases";
import { Step4Documents, DocumentItem } from "@/components/cases/step4-documents";
import { Step5Financial } from "@/components/cases/step5-financial";

interface EditCaseFormProps {
  caseData: {
    id: string;
    caseNumber: string;
    status: string;
    priority: string;
    fees: number;
    amountPaid: number;
    notes: string | null;
    startDate: Date | null;
    dueDate: Date | null;
    documents: { id: string; title: string; received: boolean; notes: string | null; order: number }[];
  };
}

export function EditCaseForm({ caseData }: EditCaseFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(caseData.status);
  const [priority, setPriority] = useState(caseData.priority);
  const [fees, setFees] = useState(caseData.fees);
  const [amountPaid, setAmountPaid] = useState(caseData.amountPaid);
  const [notes, setNotes] = useState(caseData.notes ?? "");
  const [startDate, setStartDate] = useState(
    caseData.startDate ? new Date(caseData.startDate).toISOString().slice(0, 10) : ""
  );
  const [dueDate, setDueDate] = useState(
    caseData.dueDate ? new Date(caseData.dueDate).toISOString().slice(0, 10) : ""
  );
  const [documents, setDocuments] = useState<DocumentItem[]>(
    caseData.documents.map(d => ({
      id: d.id,
      title: d.title,
      received: d.received,
      notes: d.notes ?? "",
      order: d.order,
    }))
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await updateCase(caseData.id, {
        status: status as any,
        priority: priority as any,
        fees,
        amountPaid,
        notes,
        startDate,
        dueDate,
        documents,
      });

      if (res.success) {
        toast.success("تم تحديث المعاملة بنجاح");
        router.push(`/cases/${caseData.id}`);
      } else {
        toast.error(res.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="text-base">تفاصيل المعاملة</CardTitle>
        </CardHeader>
        <CardContent className="pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>رقم المعاملة</Label>
            <Input value={caseData.caseNumber} readOnly className="bg-muted font-mono font-semibold text-primary" />
          </div>

          <div className="space-y-2">
            <Label>الحالة</Label>
            <Select value={status} onValueChange={v => setStatus(v ?? status)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {caseStatuses.map(s => <SelectItem key={s} value={s}>{caseStatusLabels[s]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>الأولوية</Label>
            <Select value={priority} onValueChange={v => setPriority(v ?? priority)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {casePriorities.map(p => <SelectItem key={p} value={p}>{casePriorityLabels[p]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>تاريخ البداية</Label>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>تاريخ الاستحقاق</Label>
            <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="text-base">المستندات</CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <Step4Documents documents={documents} onChange={setDocuments} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="text-base">المعلومات المالية</CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <Step5Financial
            fees={fees}
            amountPaid={amountPaid}
            onFeesChange={setFees}
            onAmountPaidChange={setAmountPaid}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="text-base">الملاحظات</CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <Textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="الملاحظات الداخلية..."
            className="min-h-[120px] resize-none"
          />
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ChevronRight className="h-4 w-4 me-2" />إلغاء
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
          حفظ التعديلات
        </Button>
      </div>
    </div>
  );
}
