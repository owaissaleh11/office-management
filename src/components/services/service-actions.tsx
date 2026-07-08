"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { deleteService } from "@/actions/services";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ServiceForm } from "./service-form";

interface ServiceActionsProps {
  service: {
    id: string;
    name: string;
    categoryId: string;
    description: string | null;
    status: string;
    processingTime: string | null;
    fees: number;
    notes: string | null;
    documents: {
      id?: string;
      title: string;
      displayOrder: number;
    }[];
  };
}

export function ServiceActions({ service }: ServiceActionsProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذه الخدمة نهائياً؟")) return;
    
    setIsDeleting(true);
    try {
      const res = await deleteService(service.id);
      if (res.success) {
        toast.success("تم حذف الخدمة بنجاح");
        router.push("/services");
      } else {
        toast.error(res.error);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
          <Pencil className="h-4 w-4 me-2" /> تعديل
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4 me-2" /> حذف
        </Button>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل الخدمة</DialogTitle>
            <DialogDescription>
              قم بتعديل بيانات الخدمة واضغط على تحديث الخدمة للحفظ.
            </DialogDescription>
          </DialogHeader>
          <ServiceForm 
            defaultValues={{
              id: service.id,
              name: service.name,
              categoryId: service.categoryId,
              description: service.description || "",
              status: service.status as any,
              processingTime: service.processingTime || "",
              fees: service.fees,
              notes: service.notes || "",
              documents: service.documents.map(d => ({
                id: d.id,
                title: d.title,
                displayOrder: d.displayOrder
              })),
            }}
            onSuccess={() => setIsEditOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
