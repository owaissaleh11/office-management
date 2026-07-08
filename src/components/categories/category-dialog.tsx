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
import { CategoryForm } from "./category-form";

export function CategoryDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button>
          <Plus className="me-2 h-4 w-4" /> إضافة قسم
        </Button>
      } />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>إضافة قسم جديد</DialogTitle>
          <DialogDescription>
            أدخل بيانات القسم الجديد هنا.
          </DialogDescription>
        </DialogHeader>
        <CategoryForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
