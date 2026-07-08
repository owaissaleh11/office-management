"use client";

import { useState } from "react";
import { Search, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  fees: number;
  processingTime: string | null;
  status: string;
  category: { name: string };
  documents: { id: string; title: string }[];
}

interface Step1Props {
  services: Service[];
  selectedId: string;
  onSelect: (service: Service) => void;
}

export function Step1SelectService({ services, selectedId, onSelect }: Step1Props) {
  const [query, setQuery] = useState("");
  const filtered = services.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase()) ||
    s.category.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="ابحث عن خدمة..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="pr-9"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
        {filtered.map(service => {
          const isSelected = service.id === selectedId;
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => onSelect(service)}
              className={cn(
                "text-right p-4 rounded-xl border-2 transition-all duration-200 hover:border-primary/50 hover:shadow-sm",
                isSelected ? "border-primary bg-primary/5 shadow-md" : "border-border bg-card"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <p className="font-semibold text-sm">{service.name}</p>
                  <p className="text-xs text-muted-foreground">{service.category.name}</p>
                </div>
                {isSelected && <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="text-xs">
                  {service.fees > 0 ? `${service.fees} دينار` : "مجانية"}
                </Badge>
                {service.processingTime && (
                  <Badge variant="secondary" className="text-xs">{service.processingTime}</Badge>
                )}
                <Badge variant="secondary" className="text-xs">
                  {service.documents.length} مستند
                </Badge>
              </div>
            </button>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-8 text-muted-foreground text-sm">
            لا توجد خدمات مطابقة للبحث
          </div>
        )}
      </div>
    </div>
  );
}
