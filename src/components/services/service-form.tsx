"use client";

import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { serviceSchema, ServiceFormValues } from "@/lib/validations/service";
import { getCategories } from "@/actions/categories";
import { createService, updateService } from "@/actions/services";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { DocumentsDndList } from "@/components/services/documents-dnd-list";

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

interface ServiceFormProps {
  onSuccess?: () => void;
  defaultValues?: ServiceFormValues & { id?: string };
}

export function ServiceForm({ onSuccess, defaultValues }: ServiceFormProps) {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: defaultValues || {
      name: "",
      categoryId: "",
      description: "",
      documents: [],
      processingTime: "",
      fees: 0,
      notes: "",
      status: "ACTIVE",
    },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = methods;

  const categoryId = watch("categoryId");
  const status = watch("status");

  useEffect(() => {
    async function loadCategories() {
      const cats = await getCategories();
      setCategories(cats);
      setLoadingCats(false);
    }
    loadCategories();
  }, []);

  const onSubmit = async (data: ServiceFormValues) => {
    setIsSubmitting(true);
    try {
      if (defaultValues?.id) {
        const res = await updateService(defaultValues.id, data);
        if (res.success) {
          toast.success("تم تحديث الخدمة بنجاح");
          onSuccess?.();
        } else {
          toast.error(res.error);
        }
      } else {
        const res = await createService(data);
        if (res.success) {
          toast.success("تمت إضافة الخدمة بنجاح");
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
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">اسم الخدمة <span className="text-destructive">*</span></Label>
          <Input id="name" placeholder="مثال: إصدار ترخيص" {...register("name")} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>القسم <span className="text-destructive">*</span></Label>
          <Select 
            value={categoryId} 
            onValueChange={(val) => setValue("categoryId", val || "")}
            disabled={loadingCats}
          >
            <SelectTrigger>
              <SelectValue placeholder={loadingCats ? "جاري التحميل..." : "اختر القسم"} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
        </div>

        {/* Processing Time */}
        <div className="space-y-2">
          <Label htmlFor="processingTime">الوقت المستغرق</Label>
          <Input id="processingTime" placeholder="مثال: 3-5 أيام عمل" {...register("processingTime")} />
        </div>

        {/* Fees */}
        <div className="space-y-2">
          <Label htmlFor="fees">الرسوم (دينار)</Label>
          <Input id="fees" type="number" step="0.01" {...register("fees", { valueAsNumber: true })} />
          {errors.fees && <p className="text-sm text-destructive">{errors.fees.message}</p>}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label>الحالة</Label>
          <Select 
            value={status} 
            onValueChange={(val) => setValue("status", val as "ACTIVE" | "INACTIVE" | "ARCHIVED")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">نشط</SelectItem>
              <SelectItem value="INACTIVE">غير نشط</SelectItem>
              <SelectItem value="ARCHIVED">مؤرشف</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">وصف الخدمة</Label>
        <Textarea id="description" placeholder="وصف تفصيلي للخدمة..." {...register("description")} />
      </div>

      {/* Required Docs DND List */}
      <DocumentsDndList />

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">ملاحظات إضافية</Label>
        <Textarea id="notes" placeholder="أي ملاحظات أو شروط أخرى" {...register("notes")} />
      </div>

      <div className="pt-4 flex justify-end gap-2">
        {onSuccess && (
          <Button type="button" variant="outline" onClick={onSuccess}>
            إلغاء
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
          {defaultValues?.id ? "تحديث الخدمة" : "حفظ الخدمة"}
        </Button>
      </div>
    </form>
  </FormProvider>
  );
}
