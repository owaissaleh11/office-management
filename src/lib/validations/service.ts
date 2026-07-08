import * as z from "zod";

export const serviceSchema = z.object({
  name: z.string().min(3, "عنوان الخدمة يجب أن يكون 3 أحرف على الأقل").max(100),
  categoryId: z.string().min(1, "يرجى اختيار القسم"),
  description: z.string().optional(),
  documents: z.array(z.object({
    id: z.string().optional(),
    title: z.string().min(1, "عنوان المستند مطلوب"),
    displayOrder: z.number().int(),
  })),
  processingTime: z.string().optional(),
  fees: z.number().min(0, "الرسوم يجب أن تكون 0 أو أكثر"),
  notes: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]),
  attachments: z.string().optional(), // For simplicity, we keep this as string right now
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;
