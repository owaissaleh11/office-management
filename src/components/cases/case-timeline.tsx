import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  FilePlus2, FileCheck2, FileMinus2, RefreshCw, CheckCircle2, Edit3, Clock, UploadCloud, Trash2
} from "lucide-react";

interface TimelineEvent {
  id: string;
  event: string;
  details: string | null;
  createdAt: Date;
  createdBy: string | null;
}

const getIcon = (event: string) => {
  if (event.includes("إنشاء")) return FilePlus2;
  if (event.includes("رفع")) return UploadCloud;
  if (event.includes("حذف")) return Trash2;
  if (event.includes("حالة")) return RefreshCw;
  if (event.includes("مكتمل") || event.includes("تسليم")) return CheckCircle2;
  if (event.includes("تحديث") || event.includes("تعديل")) return Edit3;
  if (event.includes("مستند")) return FileCheck2;
  return Clock;
};

const getIconColor = (event: string) => {
  if (event.includes("إنشاء")) return "text-blue-600 bg-blue-100";
  if (event.includes("رفع")) return "text-purple-600 bg-purple-100";
  if (event.includes("حذف")) return "text-red-600 bg-red-100";
  if (event.includes("حالة")) return "text-amber-600 bg-amber-100";
  if (event.includes("مكتمل") || event.includes("تسليم")) return "text-green-600 bg-green-100";
  return "text-slate-600 bg-slate-100";
};

export function CaseTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-6">لا توجد أحداث مسجلة بعد.</p>;
  }

  return (
    <div className="relative space-y-4">
      {events.map((event, i) => {
        const Icon = getIcon(event.event);
        const color = getIconColor(event.event);
        return (
          <div key={event.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`rounded-full p-2 shrink-0 ${color}`}>
                <Icon className="h-4 w-4" />
              </div>
              {i < events.length - 1 && (
                <div className="w-px flex-1 bg-border mt-2" />
              )}
            </div>
            <div className="pb-4 flex-1">
              <p className="text-sm font-medium">{event.event}</p>
              {event.details && (
                <p className="text-xs text-muted-foreground mt-0.5">{event.details}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(event.createdAt), "PPp", { locale: ar })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
