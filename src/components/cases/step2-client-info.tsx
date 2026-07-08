"use client";

import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClientFormValues } from "@/lib/validations/client";

interface Step2Props {
  form: UseFormReturn<ClientFormValues>;
  existingClient?: { id: string; fullName: string; phone: string; nationalId?: string | null } | null;
  onExistingFound?: (client: { id: string; fullName: string } | null) => void;
}

export function Step2ClientInfo({ form, existingClient }: Step2Props) {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-4">
      {existingClient && (
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800">
          ✓ تم تحديد عميل موجود: <strong>{existingClient.fullName}</strong>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">الاسم الكامل <span className="text-destructive">*</span></Label>
          <Input id="fullName" {...register("fullName")} placeholder="محمد أحمد" />
          {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="nationalId">رقم الهوية / جواز السفر</Label>
          <Input id="nationalId" {...register("nationalId")} placeholder="1234567890" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">رقم الهاتف <span className="text-destructive">*</span></Label>
          <Input id="phone" {...register("phone")} placeholder="07xxxxxxxx" />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">البريد الإلكتروني (اختياري)</Label>
          <Input id="email" type="email" {...register("email")} placeholder="example@email.com" />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="nationality">الجنسية</Label>
          <Input id="nationality" {...register("nationality")} placeholder="أردني" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthDate">تاريخ الميلاد (اختياري)</Label>
          <Input id="birthDate" type="date" {...register("birthDate")} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">العنوان</Label>
          <Input id="address" {...register("address")} placeholder="عمان، الأردن" />
        </div>
      </div>
    </div>
  );
}
