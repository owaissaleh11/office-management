"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { caseStatuses, casePriorities, caseStatusLabels, casePriorityLabels } from "@/lib/validations/case";

interface Step3Props {
  caseNumber: string;
  status: string;
  priority: string;
  startDate: string;
  dueDate: string;
  onStatusChange: (v: string) => void;
  onPriorityChange: (v: string) => void;
  onStartDateChange: (v: string) => void;
  onDueDateChange: (v: string) => void;
}

export function Step3CaseInfo({
  caseNumber, status, priority, startDate, dueDate,
  onStatusChange, onPriorityChange, onStartDateChange, onDueDateChange,
}: Step3Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>رقم المعاملة</Label>
          <Input value={caseNumber} readOnly className="bg-muted font-mono text-primary font-semibold" />
          <p className="text-xs text-muted-foreground">يتم توليده تلقائياً</p>
        </div>

        <div className="space-y-2">
          <Label>الحالة</Label>
          <Select value={status} onValueChange={v => onStatusChange(v ?? status)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {caseStatuses.map(s => (
                <SelectItem key={s} value={s}>{caseStatusLabels[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>الأولوية</Label>
          <Select value={priority} onValueChange={v => onPriorityChange(v ?? priority)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {casePriorities.map(p => (
                <SelectItem key={p} value={p}>{casePriorityLabels[p]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>تاريخ البداية</Label>
          <Input type="date" value={startDate} onChange={e => onStartDateChange(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>تاريخ الاستحقاق</Label>
          <Input type="date" value={dueDate} onChange={e => onDueDateChange(e.target.value)} />
        </div>
      </div>
    </div>
  );
}
