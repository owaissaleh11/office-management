import Link from "next/link";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { ChevronLeft } from "lucide-react";
import { CaseStatusBadge } from "./case-status-badge";

interface ClientCase {
  id: string;
  caseNumber: string;
  status: string;
  createdAt: Date;
  service: { name: string };
}

interface ClientHistoryProps {
  cases: ClientCase[];
  clientName: string;
}

export function ClientHistory({ cases, clientName }: ClientHistoryProps) {
  if (cases.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        لا توجد معاملات سابقة للعميل.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {cases.map(c => (
        <li key={c.id}>
          <Link
            href={`/cases/${c.id}`}
            className="group flex items-center justify-between p-3 rounded-lg border bg-card hover:border-primary/30 hover:bg-muted/30 transition-all"
          >
            <div className="space-y-0.5">
              <p className="text-sm font-medium">{c.service.name}</p>
              <p className="text-xs text-muted-foreground font-mono">{c.caseNumber}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(c.createdAt), "dd MMM yyyy", { locale: ar })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <CaseStatusBadge status={c.status} />
              <ChevronLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
