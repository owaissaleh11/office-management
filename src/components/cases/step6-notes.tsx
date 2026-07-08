"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Step6Props {
  notes: string;
  onChange: (v: string) => void;
}

export function Step6Notes({ notes, onChange }: Step6Props) {
  return (
    <div className="space-y-3">
      <Label>الملاحظات الداخلية</Label>
      <Textarea
        value={notes}
        onChange={e => onChange(e.target.value)}
        placeholder="أضف أي ملاحظات داخلية تتعلق بهذه المعاملة..."
        className="min-h-[200px] resize-none text-sm leading-relaxed"
      />
      <p className="text-xs text-muted-foreground">{notes.length} حرف</p>
    </div>
  );
}
