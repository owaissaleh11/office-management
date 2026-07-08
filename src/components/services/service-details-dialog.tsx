"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface ServiceDetailsProps {
  service: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ServiceDetailsDialog({ service, open, onOpenChange }: ServiceDetailsProps) {
  if (!service) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تفاصيل الخدمة</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold">{service.name}</h3>
              <p className="text-sm text-muted-foreground">{service.category?.name}</p>
            </div>
            <Badge
              variant={service.status === "ACTIVE" ? "default" : service.status === "INACTIVE" ? "secondary" : "destructive"}
            >
              {service.status === "ACTIVE" ? "نشط" : service.status === "INACTIVE" ? "غير نشط" : "مؤرشف"}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium text-primary-foreground/80">رسوم الخدمة</h3>
              <p>{service.fees > 0 ? `${service.fees} دينار` : "مجانية"}</p>
            </div>
            <div>
              <span className="font-semibold text-muted-foreground block">الوقت المستغرق</span>
              <p>{service.processingTime || "غير محدد"}</p>
            </div>
          </div>

          <div>
            <span className="font-semibold text-muted-foreground block">الوصف</span>
            <p className="text-sm mt-1 whitespace-pre-wrap">{service.description || "لا يوجد وصف"}</p>
          </div>

          <div>
            <span className="font-semibold text-muted-foreground block">المستندات المطلوبة</span>
            <p className="text-sm mt-1 whitespace-pre-wrap">{service.requiredDocs || "لا توجد مستندات مطلوبة"}</p>
          </div>

          <div>
            <span className="font-semibold text-muted-foreground block">ملاحظات</span>
            <p className="text-sm mt-1 whitespace-pre-wrap">{service.notes || "لا توجد ملاحظات"}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
