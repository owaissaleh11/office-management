import { Badge } from "@/components/ui/badge";
import { casePriorityLabels, casePriorities } from "@/lib/validations/case";
import { cn } from "@/lib/utils";

const priorityStyles: Record<typeof casePriorities[number], string> = {
  LOW: "bg-slate-500/15 text-slate-700 border-slate-200",
  MEDIUM: "bg-blue-500/15 text-blue-700 border-blue-200",
  HIGH: "bg-orange-500/15 text-orange-700 border-orange-200",
  URGENT: "bg-red-600/15 text-red-700 border-red-200",
};

export function CasePriorityBadge({ priority }: { priority: string }) {
  const label = casePriorityLabels[priority as typeof casePriorities[number]] ?? priority;
  const style = priorityStyles[priority as typeof casePriorities[number]] ?? "";

  return (
    <Badge variant="secondary" className={cn(style, "font-medium")}>
      {label}
    </Badge>
  );
}
