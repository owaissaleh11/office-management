import { z } from "zod";

export const caseStatuses = ["NEW", "WAITING_DOCS", "IN_PROGRESS", "COMPLETED", "DELIVERED", "CANCELLED"] as const;
export const casePriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export const caseStatusLabels: Record<typeof caseStatuses[number], string> = {
  NEW: "جديدة",
  WAITING_DOCS: "بانتظار المستندات",
  IN_PROGRESS: "قيد المعالجة",
  COMPLETED: "مكتملة",
  DELIVERED: "تم التسليم",
  CANCELLED: "ملغاة",
};

export const casePriorityLabels: Record<typeof casePriorities[number], string> = {
  LOW: "منخفضة",
  MEDIUM: "متوسطة",
  HIGH: "عالية",
  URGENT: "عاجلة",
};

export const caseSchema = z.object({
  clientId: z.string().min(1, "يرجى اختيار العميل"),
  serviceId: z.string().min(1, "يرجى اختيار الخدمة"),
  status: z.enum(caseStatuses),
  priority: z.enum(casePriorities),
  fees: z.number().min(0),
  amountPaid: z.number().min(0),
  notes: z.string().optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  documents: z.array(z.object({
    id: z.string().optional(),
    title: z.string().min(1, "عنوان المستند مطلوب"),
    received: z.boolean(),
    notes: z.string().optional(),
    order: z.number().int(),
  })),
});

export type CaseFormValues = z.infer<typeof caseSchema>;
