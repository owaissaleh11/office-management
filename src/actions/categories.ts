"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { categorySchema, CategoryFormValues } from "@/lib/validations/category";
import { auth } from "@/lib/auth";
import { logActivity } from "@/actions/activity";

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { services: true }
        }
      }
    });
    return categories;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export async function createCategory(data: CategoryFormValues) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const validatedData = categorySchema.parse(data);

    const category = await prisma.category.create({
      data: validatedData,
    });

    await logActivity(
      session.user.id,
      "تمت إضافة قسم جديد",
      `القسم: ${category.name}`
    );

    revalidatePath("/categories");
    revalidatePath("/services");
    return { success: true, category };
  } catch (error) {
    console.error("Create category error:", error);
    return { success: false, error: "حدث خطأ أثناء إضافة القسم" };
  }
}

export async function updateCategory(id: string, data: CategoryFormValues) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const validatedData = categorySchema.parse(data);

    const category = await prisma.category.update({
      where: { id },
      data: validatedData,
    });

    await logActivity(
      session.user.id,
      "تم تعديل القسم",
      `القسم: ${category.name}`
    );

    revalidatePath("/categories");
    revalidatePath("/services");
    return { success: true, category };
  } catch (error) {
    console.error("Update category error:", error);
    return { success: false, error: "حدث خطأ أثناء تعديل القسم" };
  }
}

export async function deleteCategory(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Check if category has services
    const servicesCount = await prisma.service.count({
      where: { categoryId: id },
    });

    if (servicesCount > 0) {
      return { success: false, error: "لا يمكن حذف هذا القسم لأنه يحتوي على خدمات مرتبطة به." };
    }

    const category = await prisma.category.delete({
      where: { id },
    });

    await logActivity(
      session.user.id,
      "تم حذف القسم",
      `القسم: ${category.name}`
    );

    revalidatePath("/categories");
    revalidatePath("/services");
    return { success: true };
  } catch (error) {
    console.error("Delete category error:", error);
    return { success: false, error: "حدث خطأ أثناء حذف القسم" };
  }
}
