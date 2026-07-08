"use client";

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { UploadCloud, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentUploadZoneProps {
  caseDocumentId: string;
  onUploadComplete?: () => void;
}

export function DocumentUploadZone({ caseDocumentId, onUploadComplete }: DocumentUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    const allowed = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("نوع الملف غير مدعوم. يرجى رفع: PDF, JPG, PNG, WEBP");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("حجم الملف يتجاوز 10MB");
      return;
    }

    setIsUploading(true);
    setProgress(10);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("caseDocumentId", caseDocumentId);

      setProgress(40);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      setProgress(80);

      const json = await res.json();
      if (!res.ok || json.error) {
        toast.error(json.error || "فشل رفع الملف");
      } else {
        setProgress(100);
        toast.success(`تم رفع "${file.name}" بنجاح`);
        onUploadComplete?.();
      }
    } catch {
      toast.error("حدث خطأ أثناء رفع الملف");
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
      }, 500);
    }
  }, [caseDocumentId, onUploadComplete]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach(uploadFile);
  }, [uploadFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(uploadFile);
    e.target.value = "";
  }, [uploadFile]);

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all",
        isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-muted/30",
        isUploading && "pointer-events-none opacity-60"
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !isUploading && inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" multiple className="hidden" onChange={handleFileInput}
        accept=".pdf,.jpg,.jpeg,.png,.webp" />

      {isUploading ? (
        <div className="space-y-2">
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">جاري رفع الملف...</p>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          <UploadCloud className={cn("h-8 w-8 mx-auto transition-colors", isDragging ? "text-primary" : "text-muted-foreground")} />
          <p className="text-sm font-medium">{isDragging ? "أفلت الملف هنا" : "اسحب وأفلت أو انقر للرفع"}</p>
          <p className="text-xs text-muted-foreground">PDF, JPG, PNG, WEBP — الحد الأقصى 10MB</p>
        </div>
      )}
    </div>
  );
}
