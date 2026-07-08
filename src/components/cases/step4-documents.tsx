"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface DocumentItem {
  id?: string;
  title: string;
  received: boolean;
  notes: string;
  order: number;
}

interface Step4Props {
  documents: DocumentItem[];
  onChange: (docs: DocumentItem[]) => void;
}

export function Step4Documents({ documents, onChange }: Step4Props) {
  const [newTitle, setNewTitle] = useState("");

  const addDocument = () => {
    if (!newTitle.trim()) return;
    onChange([...documents, { title: newTitle.trim(), received: false, notes: "", order: documents.length }]);
    setNewTitle("");
  };

  const removeDocument = (index: number) => {
    onChange(documents.filter((_, i) => i !== index).map((d, i) => ({ ...d, order: i })));
  };

  const toggleReceived = (index: number) => {
    const updated = [...documents];
    updated[index] = { ...updated[index], received: !updated[index].received };
    onChange(updated);
  };

  const updateNotes = (index: number, notes: string) => {
    const updated = [...documents];
    updated[index] = { ...updated[index], notes };
    onChange(updated);
  };

  const updateTitle = (index: number, title: string) => {
    const updated = [...documents];
    updated[index] = { ...updated[index], title };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {documents.map((doc, index) => (
          <div key={index} className={cn(
            "rounded-xl border p-4 transition-all space-y-3",
            doc.received ? "bg-green-50 border-green-200" : "bg-card"
          )}>
            <div className="flex items-center gap-3">
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7 shrink-0 rounded-full",
                  doc.received ? "bg-green-500 text-white hover:bg-green-600" : "border border-border hover:bg-muted"
                )}
                onClick={() => toggleReceived(index)}
              >
                {doc.received ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 text-muted-foreground" />}
              </Button>

              <Input
                value={doc.title}
                onChange={e => updateTitle(index, e.target.value)}
                className="flex-1 h-8 text-sm"
              />

              <Badge variant={doc.received ? "default" : "secondary"} className={doc.received ? "bg-green-500/15 text-green-700 border-green-200" : ""}>
                {doc.received ? "مستلم" : "مفقود"}
              </Badge>

              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0" onClick={() => removeDocument(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <Input
              value={doc.notes}
              onChange={e => updateNotes(index, e.target.value)}
              placeholder="ملاحظات على هذا المستند..."
              className="text-xs h-7 mr-10"
            />
          </div>
        ))}

        {documents.length === 0 && (
          <div className="text-center py-6 border-2 border-dashed rounded-xl text-muted-foreground text-sm">
            لا توجد مستندات. أضف مستندات مطلوبة للمعاملة.
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="اسم المستند الجديد..."
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addDocument(); } }}
        />
        <Button type="button" variant="outline" onClick={addDocument} disabled={!newTitle.trim()}>
          <Plus className="h-4 w-4 me-2" />إضافة
        </Button>
      </div>
    </div>
  );
}
