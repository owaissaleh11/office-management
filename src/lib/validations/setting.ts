import * as z from "zod";

const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const settingSchema = z.object({
  officeName: z.string().min(2, "اسم المكتب يجب أن يكون أكثر من حرفين"),
  email: z.union([z.literal(""), z.string().email("صيغة البريد الإلكتروني غير صحيحة")]),
  phone: z.string().optional(),
  address: z.string().optional(),
  workingHours: z.string().optional(),
  // For file upload validation on client side, we use 'any' and handle validation if it's a File object
  logo: z.any()
    .refine((file) => {
      if (!file || typeof file === 'string') return true; // Empty or existing URL string
      return file?.size <= MAX_FILE_SIZE;
    }, `حجم الصورة يجب أن لا يتجاوز 5 ميجابايت.`)
    .refine((file) => {
      if (!file || typeof file === 'string') return true;
      return ACCEPTED_IMAGE_TYPES.includes(file?.type);
    }, "فقط صيغ .jpg, .jpeg, .png و .webp مسموحة.")
    .optional(),
});

export type SettingFormValues = z.infer<typeof settingSchema>;
