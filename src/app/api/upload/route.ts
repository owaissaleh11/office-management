import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const caseDocumentId = formData.get("caseDocumentId") as string | null;

    if (!file || !caseDocumentId) {
      return NextResponse.json({ error: "بيانات مفقودة" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "نوع الملف غير مدعوم. الأنواع المسموحة: PDF, JPG, PNG, WEBP" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "حجم الملف يتجاوز الحد الأقصى (10MB)" }, { status: 400 });
    }

    const caseDoc = await prisma.caseDocument.findUnique({
      where: { id: caseDocumentId },
      select: { caseId: true },
    });

    if (!caseDoc) {
      return NextResponse.json({ error: "المستند غير موجود" }, { status: 404 });
    }

    // Build upload directory
    const uploadDir = path.join(process.cwd(), "public", "uploads", caseDoc.caseId);
    await mkdir(uploadDir, { recursive: true });

    // Create unique filename
    const ext = file.name.split(".").pop() || "bin";
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `/uploads/${caseDoc.caseId}/${uniqueName}`;
    const fullPath = path.join(process.cwd(), "public", filePath);

    const bytes = await file.arrayBuffer();
    await writeFile(fullPath, Buffer.from(bytes));

    // Save to DB
    const documentFile = await prisma.documentFile.create({
      data: {
        caseDocumentId,
        fileName: uniqueName,
        originalName: file.name,
        filePath,
        fileSize: file.size,
        mimeType: file.type,
        uploadedBy: session?.user?.id ?? null,
      },
    });

    // Add timeline event
    const caseData = await prisma.caseDocument.findUnique({
      where: { id: caseDocumentId },
      select: { caseId: true, title: true },
    });

    if (caseData) {
      await prisma.caseTimeline.create({
        data: {
          caseId: caseData.caseId,
          event: "تم رفع ملف",
          details: `${file.name} → ${caseData.title}`,
          createdBy: session?.user?.id ?? null,
        },
      });
    }

    return NextResponse.json({ success: true, file: documentFile });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء رفع الملف" }, { status: 500 });
  }
}
