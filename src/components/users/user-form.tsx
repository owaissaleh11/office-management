"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  createUserSchema, 
  updateUserSchema, 
  CreateUserFormValues,
  UpdateUserFormValues 
} from "@/lib/validations/user";
import { createUser, updateUser } from "@/actions/users";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserFormProps {
  onSuccess?: () => void;
  defaultValues?: UpdateUserFormValues & { id?: string };
}

export function UserForm({ onSuccess, defaultValues }: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditing = !!defaultValues?.id;
  const schema = isEditing ? updateUserSchema : createUserSchema;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || {
      name: "",
      email: "",
      password: "",
      isActive: true,
    },
  });


  const isActive = watch("isActive");

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (isEditing) {
        const res = await updateUser(defaultValues!.id!, data);
        if (res.success) {
          toast.success("تم تحديث بيانات المستخدم بنجاح");
          onSuccess?.();
        } else {
          toast.error(res.error);
        }
      } else {
        const res = await createUser(data);
        if (res.success) {
          toast.success("تمت إضافة المستخدم بنجاح");
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">الاسم <span className="text-destructive">*</span></Label>
          <Input id="name" placeholder="الاسم الكامل" {...register("name")} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">البريد الإلكتروني <span className="text-destructive">*</span></Label>
          <Input id="email" type="email" placeholder="example@domain.com" {...register("email")} dir="ltr" />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message as string}</p>}
        </div>

        {!isEditing && (
          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور <span className="text-destructive">*</span></Label>
            <Input id="password" type="password" {...register("password")} dir="ltr" />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message as string}</p>}
          </div>
        )}



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
      </div>

      <div className="pt-4 flex justify-end gap-2">
        {onSuccess && (
          <Button type="button" variant="outline" onClick={onSuccess}>
            إلغاء
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
          {isEditing ? "تحديث المستخدم" : "حفظ المستخدم"}
        </Button>
      </div>
    </form>
  );
}
