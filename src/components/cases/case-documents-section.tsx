"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Check, X, ChevronDown, ChevronUp, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentUploadZone } from "./document-upload-zone";
import { DocumentFileItem } from "./document-file-item";
import {
  updateCaseDocument,
  addCaseDocument,
  deleteCaseDocument,
} from "@/actions/case-documents";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface DocumentFile {
  id: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
}

interface CaseDocument {
  id: string;
  title: string;
  received: boolean;
  notes: string | null;
  order: number;
  files: DocumentFile[];
}

interface CaseDocumentsSectionProps {
  caseId: string;
  documents: CaseDocument[];
}

function SingleDocument({ doc, onRefresh }: { doc: CaseDocument; onRefresh: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(doc.title);
  const [isPending, startTransition] = useTransition();

  const toggleReceived = () => {
    startTransition(async () => {
      const res = await updateCaseDocument(doc.id, { received: !doc.received });
      if (res.success) {
        toast.success(doc.received ? "تم تحديد المستند كمفقود" : "تم تحديد المستند كمستلم");
        onRefresh();
      } else {
        toast.error(res.error);
      }
    });
  };

  const saveTitle = () => {
    if (!title.trim()) return;
    startTransition(async () => {
      const res = await updateCaseDocument(doc.id, { title: title.trim() });
      if (res.success) {
        toast.success("تم تعديل اسم المستند");
        setIsEditing(false);
        onRefresh();
      } else {
        toast.error(res.error);
      }
    });
  };

  const handleDelete = () => {
    if (!confirm(`هل تريد حذف مستند "${doc.title}"؟`)) return;
    startTransition(async () => {
      const res = await deleteCaseDocument(doc.id);
      if (res.success) {
        toast.success("تم حذف المستند");
        onRefresh();
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <div className={cn(
      "rounded-xl border transition-all",
      doc.received ? "border-green-200 bg-green-50/50" : "border-border bg-card"
    )}>
      <div className="p-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-full shrink-0 transition-colors",
            doc.received
              ? "bg-green-500 text-white hover:bg-green-600"
              : "border border-border hover:bg-muted"
          )}
          onClick={toggleReceived}
          disabled={isPending}
        >
          {doc.received ? <Check className="h-4 w-4" /> : <X className="h-4 w-4 text-muted-foreground" />}
        </Button>

        {isEditing ? (
          <div className="flex-1 flex gap-2">
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="h-8"
              autoFocus
              onKeyDown={e => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") setIsEditing(false); }}
            />
            <Button size="sm" onClick={saveTitle} disabled={isPending}>حفظ</Button>
            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>إلغاء</Button>
          </div>
        ) : (
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{doc.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge
                variant="secondary"
                className={cn("text-xs", doc.received
                  ? "bg-green-500/15 text-green-700 border-green-200"
                  : "bg-amber-500/15 text-amber-700 border-amber-200"
                )}
              >
                {doc.received ? "✓ مستلم" : "✗ مفقود"}
              </Badge>
              {doc.files.length > 0 && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Paperclip className="h-3 w-3" />{doc.files.length} ملف
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditing(true)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
            disabled={isPending}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsExpanded(e => !e)}>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t p-4 space-y-3">
          {doc.files.length > 0 && (
            <div className="space-y-2">
              {doc.files.map(file => (
                <DocumentFileItem key={file.id} file={file} />
              ))}
            </div>
          )}
          <DocumentUploadZone caseDocumentId={doc.id} onUploadComplete={onRefresh} />
        </div>
      )}
    </div>
  );
}

export function CaseDocumentsSection({ caseId, documents }: CaseDocumentsSectionProps) {
  const router = useRouter();
  const [newTitle, setNewTitle] = useState("");
  const [isAdding, startTransition] = useTransition();

  const refresh = () => router.refresh();

  const handleAddDocument = () => {
    if (!newTitle.trim()) return;
    startTransition(async () => {
      const res = await addCaseDocument(caseId, newTitle.trim());
      if (res.success) {
        toast.success("تم إضافة المستند");
        setNewTitle("");
        refresh();
      } else {
        toast.error(res.error);
      }
    });
  };

  const received = documents.filter(d => d.received).length;

  return (
    <Card>
      <CardHeader className="bg-muted/30 border-b pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Paperclip className="h-4 w-4 text-primary" /> المستندات المطلوبة
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {received} / {documents.length} مستلم
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-5 space-y-3">
        {documents.map(doc => (
          <SingleDocument key={doc.id} doc={doc} onRefresh={refresh} />
        ))}

        {documents.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">لا توجد مستندات مضافة.</p>
        )}

        <div className="flex gap-2 pt-2">
          <Input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="اسم مستند جديد..."
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddDocument(); } }}
          />
          <Button variant="outline" onClick={handleAddDocument} disabled={!newTitle.trim() || isAdding}>
            <Plus className="h-4 w-4 me-2" />إضافة
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
