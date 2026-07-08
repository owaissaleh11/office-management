import * as z from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل").max(50),
  description: z.string().optional(),
  isActive: z.boolean(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
