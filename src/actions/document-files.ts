"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

export async function deleteDocumentFile(id: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const file = await prisma.documentFile.findUnique({
      where: { id },
      include: { caseDocument: { select: { caseId: true, title: true } } },
    });
    if (!file) return { success: false, error: "الملف غير موجود" };

    // Delete from disk
    try {
      const fullPath = path.join(process.cwd(), "public", file.filePath);
      await fs.unlink(fullPath);
    } catch {
      // File may already be deleted from disk, continue
    }

    await prisma.documentFile.delete({ where: { id } });

    await prisma.caseTimeline.create({
      data: {
        caseId: file.caseDocument.caseId,
        event: "تم حذف ملف",
        details: `${file.originalName} من: ${file.caseDocument.title}`,
        createdBy: userId,
      },
    });

    revalidatePath(`/cases/${file.caseDocument.caseId}`);
    return { success: true };
  } catch (error) {
    console.error("Delete file error:", error);
    return { success: false, error: "حدث خطأ أثناء حذف الملف" };
  }
}
