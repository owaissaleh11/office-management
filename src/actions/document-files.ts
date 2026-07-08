"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function deleteDocumentFile(id: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const file = await prisma.documentFile.findUnique({
      where: { id },
      include: { caseDocument: { select: { caseId: true, title: true } } },
    });
    if (!file) return { success: false, error: "الملف غير موجود" };

    if (!supabaseUrl || !supabaseKey) {
      return { success: false, error: "إعدادات التخزين السحابي مفقودة" };
    }

    // Delete from Supabase Storage
    const storagePath = `${file.caseDocument.caseId}/${file.fileName}`;
    const { error: deleteError } = await supabase.storage
      .from("uploads")
      .remove([storagePath]);

    if (deleteError) {
      console.error("Supabase file delete error:", deleteError);
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
