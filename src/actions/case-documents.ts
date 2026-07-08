"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function updateCaseDocument(id: string, data: { received?: boolean; notes?: string; title?: string }) {
  try {
    const doc = await prisma.caseDocument.update({
      where: { id },
      data,
    });
    const caseDoc = await prisma.caseDocument.findUnique({ where: { id }, select: { caseId: true } });
    if (caseDoc) revalidatePath(`/cases/${caseDoc.caseId}`);
    return { success: true, doc };
  } catch (error) {
    console.error("Update document error:", error);
    return { success: false, error: "حدث خطأ أثناء تعديل المستند" };
  }
}

export async function addCaseDocument(caseId: string, title: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const count = await prisma.caseDocument.count({ where: { caseId } });
    const doc = await prisma.caseDocument.create({
      data: { caseId, title, received: false, order: count },
    });

    await prisma.caseTimeline.create({
      data: { caseId, event: "تمت إضافة مستند", details: title, createdBy: userId },
    });

    revalidatePath(`/cases/${caseId}`);
    return { success: true, doc };
  } catch (error) {
    console.error("Add document error:", error);
    return { success: false, error: "حدث خطأ أثناء إضافة المستند" };
  }
}

export async function deleteCaseDocument(id: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const doc = await prisma.caseDocument.findUnique({ where: { id }, select: { caseId: true, title: true } });
    if (!doc) return { success: false, error: "المستند غير موجود" };

    await prisma.caseDocument.delete({ where: { id } });

    await prisma.caseTimeline.create({
      data: { caseId: doc.caseId, event: "تم حذف مستند", details: doc.title, createdBy: userId },
    });

    revalidatePath(`/cases/${doc.caseId}`);
    return { success: true };
  } catch (error) {
    console.error("Delete document error:", error);
    return { success: false, error: "حدث خطأ أثناء حذف المستند" };
  }
}
