"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Banknote, TrendingDown, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step5Props {
  fees: number;
  amountPaid: number;
  onFeesChange: (v: number) => void;
  onAmountPaidChange: (v: number) => void;
}

export function Step5Financial({ fees, amountPaid, onFeesChange, onAmountPaidChange }: Step5Props) {
  const remaining = fees - amountPaid;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fees">رسوم الخدمة (دينار)</Label>
          <div className="relative">
            <Banknote className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="fees"
              type="number"
              min={0}
              step={0.5}
              value={fees}
              onChange={e => onFeesChange(parseFloat(e.target.value) || 0)}
              className="pr-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amountPaid">المبلغ المدفوع (دينار)</Label>
          <div className="relative">
            <Wallet className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="amountPaid"
              type="number"
              min={0}
              step={0.5}
              value={amountPaid}
              onChange={e => onAmountPaidChange(parseFloat(e.target.value) || 0)}
              className="pr-9"
            />
          </div>
        </div>
      </div>

      {/* Summary card */}
      <div className={cn(
        "rounded-xl p-5 border flex items-center gap-4",
        remaining > 0 ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"
      )}>
        <TrendingDown className={cn("h-8 w-8", remaining > 0 ? "text-amber-600" : "text-green-600")} />
        <div>
          <p className="text-sm font-medium text-muted-foreground">الرصيد المتبقي</p>
          <p className={cn("text-2xl font-bold", remaining > 0 ? "text-amber-700" : "text-green-700")}>
            {remaining.toFixed(2)} دينار
          </p>
          {remaining <= 0 && <p className="text-xs text-green-600 mt-0.5">✓ تم السداد الكامل</p>}
        </div>
      </div>
    </div>
  );
}
