"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logActivity } from "@/actions/activity";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

export async function getSettings() {
  try {
    // There should only be one settings record
    const settings = await prisma.officeSetting.findFirst();
    return settings;
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return null;
  }
}

export async function updateSettings(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const officeName = formData.get("officeName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const workingHours = formData.get("workingHours") as string;
    
    const logoFile = formData.get("logo") as File | null;
    let logoUrl = formData.get("existingLogo") as string | null;

    if (logoFile && logoFile.size > 0 && logoFile.name !== "undefined") {
      const buffer = Buffer.from(await logoFile.arrayBuffer());
      const ext = path.extname(logoFile.name);
      const filename = `logo-${Date.now()}${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      
      // Ensure upload dir exists
      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, filename);
      await fs.writeFile(filePath, buffer);
      
      logoUrl = `/uploads/${filename}`;
    }

    const existingSettings = await prisma.officeSetting.findFirst();

    if (existingSettings) {
      await prisma.officeSetting.update({
        where: { id: existingSettings.id },
        data: {
          officeName,
          email,
          phone,
          address,
          workingHours,
          ...(logoUrl && { logo: logoUrl }),
        },
      });
    } else {
      await prisma.officeSetting.create({
        data: {
          officeName,
          email,
          phone,
          address,
          workingHours,
          ...(logoUrl && { logo: logoUrl }),
        },
      });
    }

    await logActivity(
      session.user.id,
      "تحديث إعدادات المكتب",
      "الإعدادات العامة"
    );

    revalidatePath("/settings");
    revalidatePath("/");
    
    return { success: true };
  } catch (error: any) {
    console.error("Update settings error:", error);
    return { success: false, error: error.message || "حدث خطأ أثناء حفظ الإعدادات" };
  }
}
