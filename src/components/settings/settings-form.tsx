"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingSchema, SettingFormValues } from "@/lib/validations/setting";
import { updateSettings } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Building2, Save, Upload, Loader2 } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface SettingsFormProps {
  initialData?: {
    officeName?: string | null;
    logo?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    workingHours?: string | null;
  } | null;
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const [isPending, startTransition] = React.useTransition();
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(initialData?.logo || null);

  const form = useForm<SettingFormValues>({
    resolver: zodResolver(settingSchema),
    defaultValues: {
      officeName: initialData?.officeName || "مكتبي",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      address: initialData?.address || "",
      workingHours: initialData?.workingHours || "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("logo", file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  function onSubmit(data: SettingFormValues) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("officeName", data.officeName);
      if (data.email) formData.append("email", data.email);
      if (data.phone) formData.append("phone", data.phone);
      if (data.address) formData.append("address", data.address);
      if (data.workingHours) formData.append("workingHours", data.workingHours);
      
      if (data.logo instanceof File) {
        formData.append("logo", data.logo);
      }
      if (initialData?.logo) {
        formData.append("existingLogo", initialData.logo);
      }

      const res = await updateSettings(formData);
      if (res.success) {
        toast.success("تم حفظ الإعدادات بنجاح");
      } else {
        toast.error(res.error || "حدث خطأ غير معروف");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* General Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                المعلومات الأساسية
              </CardTitle>
              <CardDescription>
                تحديث اسم المكتب وبيانات التواصل الأساسية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="officeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم المكتب / الشركة <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: مكتب النخبة للخدمات" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="info@office.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الهاتف</FormLabel>
                    <FormControl>
                      <Input dir="ltr" className="text-right" placeholder="+966 50 000 0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Details & Logo Card */}
          <Card>
            <CardHeader>
              <CardTitle>الهوية والتفاصيل</CardTitle>
              <CardDescription>
                شعار المكتب والعنوان وساعات العمل
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div className="space-y-3">
                <FormLabel>شعار المكتب (Logo)</FormLabel>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-start">
                  <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed bg-muted/50">
                    {previewUrl ? (
                      <Image
                        src={previewUrl}
                        alt="Logo preview"
                        fill
                        className="object-contain p-2"
                      />
                    ) : (
                      <Upload className="h-8 w-8 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="space-y-2 text-center sm:text-start">
                    <Button variant="outline" type="button" className="relative cursor-pointer">
                      <span>اختيار صورة جديدة</span>
                      <Input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        onChange={handleImageChange}
                      />
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, WEBP حتى 5 ميجابايت.
                    </p>
                  </div>
                </div>
                {form.formState.errors.logo && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.logo.message as string}
                  </p>
                )}
              </div>

              <Separator />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العنوان</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="الرياض، حي العليا، شارع الأمير سلطان"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="workingHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>أوقات العمل</FormLabel>
                    <FormControl>
                      <Input placeholder="من الأحد إلى الخميس، 8 صباحاً - 4 مساءً" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="me-2 h-4 w-4" />
                حفظ التغييرات
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
