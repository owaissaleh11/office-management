"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Eye, Download, FileText, ImageIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { deleteDocumentFile } from "@/actions/document-files";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DocumentFile {
  id: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentFileItem({ file }: { file: DocumentFile }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const isImage = file.mimeType.startsWith("image/");
  const isPdf = file.mimeType === "application/pdf";

  const handleDelete = async () => {
    if (!confirm(`هل تريد حذف "${file.originalName}"؟`)) return;
    setIsDeleting(true);
    const res = await deleteDocumentFile(file.id);
    if (res.success) {
      toast.success("تم حذف الملف");
    } else {
      toast.error(res.error);
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
        <div className="shrink-0 rounded-md bg-background border p-2">
          {isImage ? (
            <ImageIcon className="h-5 w-5 text-blue-500" />
          ) : (
            <FileText className="h-5 w-5 text-red-500" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{file.originalName}</p>
          <p className="text-xs text-muted-foreground">{formatBytes(file.fileSize)}</p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {(isImage || isPdf) && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPreviewOpen(true)} title="معاينة">
              <Eye className="h-4 w-4" />
            </Button>
          )}
          <a
            href={file.filePath}
            download={file.originalName}
            title="تحميل"
            className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8" })}
          >
            <Download className="h-4 w-4" />
          </a>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
            disabled={isDeleting}
            title="حذف"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{file.originalName}</DialogTitle>
          </DialogHeader>
          {isImage ? (
            <img src={file.filePath} alt={file.originalName} className="w-full rounded-lg object-contain max-h-[70vh]" />
          ) : isPdf ? (
            <iframe src={file.filePath} className="w-full h-[70vh] rounded-lg" title={file.originalName} />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
