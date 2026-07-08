import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

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

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "إعدادات التخزين السحابي مفقودة" }, { status: 500 });
    }

    const caseDoc = await prisma.caseDocument.findUnique({
      where: { id: caseDocumentId },
      select: { caseId: true },
    });

    if (!caseDoc) {
      return NextResponse.json({ error: "المستند غير موجود" }, { status: 404 });
    }

    // Create unique filename and upload to Supabase
    const ext = file.name.split(".").pop() || "bin";
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const storagePath = `${caseDoc.caseId}/${uniqueName}`;

    const { error: uploadError } = await supabase.storage
      .from("uploads")
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json({ error: "حدث خطأ أثناء الرفع السحابي" }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("uploads")
      .getPublicUrl(storagePath);

    // Save to DB
    const documentFile = await prisma.documentFile.create({
      data: {
        caseDocumentId,
        fileName: uniqueName,
        originalName: file.name,
        filePath: publicUrl,
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
