"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ServiceForm } from "./service-form";

export function ServiceFormDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button>
          <Plus className="me-2 h-4 w-4" /> إضافة خدمة
        </Button>
      } />
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إضافة خدمة جديدة</DialogTitle>
          <DialogDescription>
            قم بإدخال تفاصيل الخدمة الجديدة هنا. اضغط حفظ عند الانتهاء.
          </DialogDescription>
        </DialogHeader>
        <ServiceForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
