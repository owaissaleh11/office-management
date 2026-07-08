import { Badge } from "@/components/ui/badge";
import { caseStatusLabels, caseStatuses } from "@/lib/validations/case";
import { cn } from "@/lib/utils";

const statusStyles: Record<typeof caseStatuses[number], string> = {
  NEW: "bg-blue-500/15 text-blue-700 border-blue-200",
  WAITING_DOCS: "bg-amber-500/15 text-amber-700 border-amber-200",
  IN_PROGRESS: "bg-purple-500/15 text-purple-700 border-purple-200",
  COMPLETED: "bg-green-500/15 text-green-700 border-green-200",
  DELIVERED: "bg-emerald-500/15 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-500/15 text-red-700 border-red-200",
};

export function CaseStatusBadge({ status }: { status: string }) {
  const label = caseStatusLabels[status as typeof caseStatuses[number]] ?? status;
  const style = statusStyles[status as typeof caseStatuses[number]] ?? "";

  return (
    <Badge variant="secondary" className={cn(style, "font-medium")}>
      {label}
    </Badge>
  );
}
