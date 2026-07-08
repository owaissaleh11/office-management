"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { caseStatuses, casePriorities, caseStatusLabels, casePriorityLabels } from "@/lib/validations/case";

interface Service { id: string; name: string }

interface CaseFiltersProps {
  services: Service[];
  totalCount: number;
}

export function CaseFilters({ services, totalCount }: CaseFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => router.replace(`${pathname}?${params.toString()}`));
  };

  const clearAll = () => {
    startTransition(() => router.replace(pathname));
  };

  const hasFilters = searchParams.toString().length > 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث برقم المعاملة، اسم العميل، رقم الهوية..."
            defaultValue={searchParams.get("query") ?? ""}
            onChange={e => update("query", e.target.value)}
            className="pr-9"
          />
        </div>
        <div className="flex gap-2">
          <Select defaultValue={searchParams.get("status") ?? "all"} onValueChange={v => update("status", v ?? "all")}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="الحالة" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الحالات</SelectItem>
              {caseStatuses.map(s => <SelectItem key={s} value={s}>{caseStatusLabels[s]}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select defaultValue={searchParams.get("priority") ?? "all"} onValueChange={v => update("priority", v ?? "all")}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="الأولوية" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الأولويات</SelectItem>
              {casePriorities.map(p => <SelectItem key={p} value={p}>{casePriorityLabels[p]}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select defaultValue={searchParams.get("serviceId") ?? "all"} onValueChange={v => update("serviceId", v ?? "all")}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="الخدمة" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الخدمات</SelectItem>
              {services.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select defaultValue={searchParams.get("sort") ?? "newest"} onValueChange={v => update("sort", v ?? "newest")}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="ترتيب" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">الأحدث أولاً</SelectItem>
              <SelectItem value="oldest">الأقدم أولاً</SelectItem>
              <SelectItem value="alpha">أبجدي</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" size="icon" onClick={clearAll} title="مسح الفلاتر">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {isPending ? "جاري البحث..." : (
            <><span className="font-semibold text-foreground">{totalCount}</span> معاملة</>
          )}
        </span>
      </div>
    </div>
  );
}
