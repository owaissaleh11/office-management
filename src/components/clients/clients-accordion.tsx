"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  ChevronDown,
  ChevronLeft,
  Phone,
  FileText,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CaseStatusBadge } from "@/components/cases/case-status-badge";
import { CasePriorityBadge } from "@/components/cases/case-priority-badge";
import { cn } from "@/lib/utils";

interface ClientCase {
  id: string;
  caseNumber: string;
  status: string;
  priority: string;
  fees: number;
  amountPaid: number;
  remainingBalance: number;
  createdAt: Date;
  service: { id: string; name: string };
}

interface ClientWithCases {
  id: string;
  fullName: string;
  phone: string;
  nationalId: string | null;
  createdAt: Date;
  _count: { cases: number };
  cases: ClientCase[];
}

interface ClientsAccordionProps {
  clients: ClientWithCases[];
}

export function ClientsAccordion({ clients }: ClientsAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => setOpenId(prev => (prev === id ? null : id));

  return (
    <div className="space-y-2">
      {clients.map(client => {
        const isOpen = openId === client.id;
        return (
          <div
            key={client.id}
            className={cn(
              "rounded-xl border bg-card shadow-sm transition-all duration-200",
              isOpen && "border-primary/30 shadow-md"
            )}
          >
            {/* Header row */}
            <button
              type="button"
              onClick={() => toggle(client.id)}
              className="w-full flex items-center justify-between gap-4 p-4 text-right group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm transition-colors",
                    isOpen
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  {client.fullName.charAt(0)}
                </div>
                <div className="min-w-0 text-right">
                  <p className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                    {client.fullName}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-0.5">
                    {client.phone && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {client.phone}
                      </span>
                    )}
                    {client.nationalId && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <FileText className="h-3 w-3" />
                        {client.nationalId}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs transition-colors",
                    client._count.cases > 0
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "text-muted-foreground"
                  )}
                >
                  {client._count.cases} معاملة
                </Badge>
                <Link
                  href={`/clients/${client.id}`}
                  onClick={e => e.stopPropagation()}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  title="عرض الملف الكامل"
                >
                  <User className="h-4 w-4" />
                </Link>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-300",
                    isOpen && "rotate-180"
                  )}
                />
              </div>
            </button>

            {/* Expandable cases list */}
            <div
              className={cn(
                "overflow-hidden transition-all duration-300",
                isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <div className="border-t px-4 py-3">
                {client.cases.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    لا توجد معاملات لهذا العميل.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {client.cases.map(c => (
                      <li key={c.id}>
                        <Link
                          href={`/cases/${c.id}`}
                          className="group/case flex items-center justify-between gap-3 p-3 rounded-lg border bg-muted/30 hover:border-primary/30 hover:bg-primary/5 transition-all"
                        >
                          <div className="space-y-0.5 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {c.service.name}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {c.caseNumber}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(c.createdAt), "dd MMM yyyy", {
                                locale: ar,
                              })}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <CaseStatusBadge status={c.status} />
                            <CasePriorityBadge priority={c.priority} />
                            {c.remainingBalance > 0 && (
                              <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-400">
                                {c.remainingBalance.toFixed(0)} د
                              </span>
                            )}
                            <ChevronLeft className="h-4 w-4 text-muted-foreground group-hover/case:text-primary transition-colors" />
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
