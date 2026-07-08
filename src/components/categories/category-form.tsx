"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, CategoryFormValues } from "@/lib/validations/category";
import { createCategory, updateCategory } from "@/actions/categories";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CategoryFormProps {
  onSuccess?: () => void;
  defaultValues?: CategoryFormValues & { id?: string };
}

export function CategoryForm({ onSuccess, defaultValues }: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: defaultValues || {
      name: "",
      description: "",
      isActive: true,
    },
  });

  const isActive = watch("isActive");

  const onSubmit = async (data: CategoryFormValues) => {
    setIsSubmitting(true);
    try {
      if (defaultValues?.id) {
        const res = await updateCategory(defaultValues.id, data);
        if (res.success) {
          toast.success("تم تحديث القسم بنجاح");
          onSuccess?.();
        } else {
          toast.error(res.error);
        }
      } else {
        const res = await createCategory(data);
        if (res.success) {
          toast.success("تمت إضافة القسم بنجاح");
          onSuccess?.();
        } else {
          toast.error(res.error);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">اسم القسم <span className="text-destructive">*</span></Label>
        <Input id="name" placeholder="مثال: الخدمات العامة" {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">وصف القسم</Label>
        <Textarea id="description" placeholder="وصف للقسم والخدمات التي يقدمها..." {...register("description")} />
      </div>

      <div className="space-y-2">
        <Label>الحالة</Label>
        <Select 
          value={isActive ? "true" : "false"} 
          onValueChange={(val) => setValue("isActive", val === "true")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">نشط</SelectItem>
            <SelectItem value="false">غير نشط</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="pt-4 flex justify-end gap-2">
        {onSuccess && (
          <Button type="button" variant="outline" onClick={onSuccess}>
            إلغاء
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
          {defaultValues?.id ? "تحديث القسم" : "حفظ القسم"}
        </Button>
      </div>
    </form>
  );
}
