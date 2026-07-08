"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { caseSchema, CaseFormValues } from "@/lib/validations/case";
import { auth } from "@/lib/auth";

async function addTimelineEvent(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  caseId: string,
  event: string,
  details?: string,
  userId?: string
) {
  await tx.caseTimeline.create({
    data: { caseId, event, details, createdBy: userId },
  });
}

async function generateCaseNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.case.count({
    where: { caseNumber: { startsWith: `${year}-` } },
  });
  const seq = String(count + 1).padStart(4, "0");
  return `${year}-${seq}`;
}

export async function getCases(params?: {
  query?: string;
  status?: string;
  priority?: string;
  serviceId?: string;
  startDate?: string;
  endDate?: string;
  sort?: "newest" | "oldest" | "alpha";
}) {
  try {
    const { query = "", status, priority, serviceId, startDate, endDate, sort = "newest" } = params || {};
    return await prisma.case.findMany({
      where: {
        AND: [
          query ? {
            OR: [
              { caseNumber: { contains: query } },
              { client: { fullName: { contains: query } } },
              { client: { nationalId: { contains: query } } },
              { client: { phone: { contains: query } } },
            ],
          } : {},
          status ? { status } : {},
          priority ? { priority } : {},
          serviceId ? { serviceId } : {},
          startDate ? { createdAt: { gte: new Date(startDate) } } : {},
          endDate ? { createdAt: { lte: new Date(endDate) } } : {},
        ],
      },
      include: {
        client: { select: { id: true, fullName: true, phone: true } },
        service: { select: { id: true, name: true } },
        _count: { select: { documents: true } },
      },
      orderBy: sort === "newest" ? { createdAt: "desc" }
        : sort === "oldest" ? { createdAt: "asc" }
        : { client: { fullName: "asc" } },
    });
  } catch (error) {
    console.error("Failed to fetch cases:", error);
    return [];
  }
}

export async function getCaseById(id: string) {
  try {
    return await prisma.case.findUnique({
      where: { id },
      include: {
        client: true,
        service: {
          include: { category: { select: { name: true } } },
        },
        documents: {
          include: {
            files: { orderBy: { uploadedAt: "desc" } },
          },
          orderBy: { order: "asc" },
        },
        timeline: { orderBy: { createdAt: "desc" } },
      },
    });
  } catch (error) {
    console.error("Failed to fetch case:", error);
    return null;
  }
}

export async function createCase(data: CaseFormValues) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const validated = caseSchema.parse(data);
    const caseNumber = await generateCaseNumber();
    const remainingBalance = validated.fees - validated.amountPaid;

    const newCase = await prisma.$transaction(async (tx) => {
      const created = await tx.case.create({
        data: {
          caseNumber,
          clientId: validated.clientId,
          serviceId: validated.serviceId,
          status: validated.status,
          priority: validated.priority,
          fees: validated.fees,
          amountPaid: validated.amountPaid,
          remainingBalance,
          notes: validated.notes || null,
          startDate: validated.startDate ? new Date(validated.startDate) : null,
          dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
          documents: {
            create: validated.documents.map((doc, i) => ({
              title: doc.title,
              received: doc.received,
              notes: doc.notes || null,
              order: doc.order ?? i,
            })),
          },
        },
      });

      await addTimelineEvent(tx, created.id, "تم إنشاء المعاملة", `رقم المعاملة: ${caseNumber}`, userId);
      return created;
    });

    revalidatePath("/cases");
    revalidatePath("/");
    return { success: true, case: newCase };
  } catch (error) {
    console.error("Create case error:", error);
    return { success: false, error: "حدث خطأ أثناء إنشاء المعاملة" };
  }
}

export async function updateCase(id: string, data: Partial<CaseFormValues> & { notes?: string }) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const existing = await prisma.case.findUnique({ where: { id }, select: { status: true, fees: true } });
    if (!existing) return { success: false, error: "المعاملة غير موجودة" };

    const fees = data.fees ?? existing.fees;
    const amountPaid = data.amountPaid ?? 0;
    const remainingBalance = fees - amountPaid;

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.case.update({
        where: { id },
        data: {
          status: data.status ?? existing.status,
          priority: data.priority,
          fees,
          amountPaid,
          remainingBalance,
          notes: data.notes ?? undefined,
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        },
      });

      if (data.documents) {
        await tx.caseDocument.deleteMany({ where: { caseId: id } });
        await tx.caseDocument.createMany({
          data: data.documents.map((doc, i) => ({
            caseId: id,
            title: doc.title,
            received: doc.received,
            notes: doc.notes || null,
            order: doc.order ?? i,
          })),
        });
      }

      if (data.status && data.status !== existing.status) {
        await addTimelineEvent(tx, id, "تم تغيير حالة المعاملة", `من: ${existing.status} → إلى: ${data.status}`, userId);
      } else {
        await addTimelineEvent(tx, id, "تم تحديث بيانات المعاملة", undefined, userId);
      }

      return result;
    });

    revalidatePath("/cases");
    revalidatePath(`/cases/${id}`);
    return { success: true, case: updated };
  } catch (error) {
    console.error("Update case error:", error);
    return { success: false, error: "حدث خطأ أثناء تعديل المعاملة" };
  }
}

export async function updateCaseStatus(id: string, status: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const existing = await prisma.case.findUnique({ where: { id }, select: { status: true } });
    if (!existing) return { success: false, error: "المعاملة غير موجودة" };

    await prisma.$transaction(async (tx) => {
      await tx.case.update({ where: { id }, data: { status } });
      await addTimelineEvent(tx, id, "تم تغيير حالة المعاملة", `إلى: ${status}`, userId);
    });

    revalidatePath("/cases");
    revalidatePath(`/cases/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Update status error:", error);
    return { success: false, error: "حدث خطأ أثناء تغيير الحالة" };
  }
}

export async function deleteCase(id: string) {
  try {
    await prisma.case.delete({ where: { id } });
    revalidatePath("/cases");
    return { success: true };
  } catch (error) {
    console.error("Delete case error:", error);
    return { success: false, error: "حدث خطأ أثناء حذف المعاملة" };
  }
}
