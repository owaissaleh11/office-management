import { z } from "zod";

export const clientSchema = z.object({
  fullName: z.string().min(2, "الاسم الكامل مطلوب"),
  nationalId: z.string().optional(),
  phone: z.string().min(7, "رقم الهاتف مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.literal("")),
  address: z.string().optional(),
  nationality: z.string().optional(),
  birthDate: z.string().optional(),
});

export type ClientFormValues = z.infer<typeof clientSchema>;
