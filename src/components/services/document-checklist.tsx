import { CheckCircle2 } from "lucide-react";

interface RequiredDocument {
  id: string;
  title: string;
  displayOrder: number;
}

interface DocumentChecklistProps {
  documents: RequiredDocument[];
}

export function DocumentChecklist({ documents }: DocumentChecklistProps) {
  if (!documents || documents.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg border border-dashed">
        لا توجد مستندات مطلوبة لهذه الخدمة.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {documents.map((doc) => (
        <li 
          key={doc.id} 
          className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors shadow-sm"
        >
          <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <span className="text-sm font-medium leading-relaxed">{doc.title}</span>
        </li>
      ))}
    </ul>
  );
}
