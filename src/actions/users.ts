"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { 
  createUserSchema, 
  updateUserSchema, 
  resetPasswordSchema,
  CreateUserFormValues,
  UpdateUserFormValues,
  ResetPasswordFormValues,
} from "@/lib/validations/user";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { logActivity } from "@/actions/activity";

// Helper to check if current user is logged in
async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return session.user;
}

export async function getUsers() {
  try {
    await checkAdmin();
    
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
      },
    });
    
    return users;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}

export async function createUser(data: CreateUserFormValues) {
  try {
    const admin = await checkAdmin();
    
    const validatedData = createUserSchema.parse(data);

    // Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    if (existingUser) {
      return { success: false, error: "البريد الإلكتروني مسجل مسبقاً" };
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        isActive: validatedData.isActive,
      },
      select: { id: true, name: true, email: true, isActive: true },
    });

    await logActivity(
      admin.id,
      "تمت إضافة مستخدم جديد",
      `المستخدم: ${user.name}`
    );

    revalidatePath("/users");
    return { success: true, user };
  } catch (error) {
    console.error("Create user error:", error);
    return { success: false, error: "حدث خطأ أثناء إضافة المستخدم" };
  }
}

export async function updateUser(id: string, data: UpdateUserFormValues) {
  try {
    const admin = await checkAdmin();
    
    const validatedData = updateUserSchema.parse(data);

    // Check if email exists and is not the same user
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    if (existingUser && existingUser.id !== id) {
      return { success: false, error: "البريد الإلكتروني مسجل لمستخدم آخر" };
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        name: validatedData.name,
        email: validatedData.email,
        isActive: validatedData.isActive,
      },
      select: { id: true, name: true, email: true, isActive: true },
    });

    await logActivity(
      admin.id,
      "تم تعديل بيانات المستخدم",
      `المستخدم: ${user.name}`
    );

    revalidatePath("/users");
    return { success: true, user };
  } catch (error) {
    console.error("Update user error:", error);
    return { success: false, error: "حدث خطأ أثناء تعديل المستخدم" };
  }
}

export async function resetUserPassword(id: string, passwordData: ResetPasswordFormValues) {
  try {
    const admin = await checkAdmin();
    const validatedData = resetPasswordSchema.parse(passwordData);

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const user = await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    await logActivity(
      admin.id,
      "تم إعادة تعيين كلمة مرور المستخدم",
      `المستخدم: ${user.name}`
    );

    return { success: true };
  } catch (error) {
    console.error("Reset password error:", error);
    return { success: false, error: "حدث خطأ أثناء إعادة تعيين كلمة المرور" };
  }
}

export async function toggleUserStatus(id: string, currentStatus: boolean) {
  try {
    const admin = await checkAdmin();
    
    if (admin.id === id) {
      return { success: false, error: "لا يمكنك إيقاف حسابك الخاص" };
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isActive: !currentStatus },
    });

    await logActivity(
      admin.id,
      !currentStatus ? "تم تفعيل المستخدم" : "تم إيقاف المستخدم",
      `المستخدم: ${user.name}`
    );

    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    console.error("Toggle status error:", error);
    return { success: false, error: "حدث خطأ أثناء تغيير حالة المستخدم" };
  }
}

export async function deleteUser(id: string) {
  try {
    const admin = await checkAdmin();

    // Prevent deleting own account
    if (admin.id === id) {
      return { success: false, error: "لا يمكنك حذف حسابك الخاص" };
    }

    // Prevent deleting the oldest user (considered the main admin)
    const oldestUser = await prisma.user.findFirst({
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    if (oldestUser?.id === id) {
      return { success: false, error: "لا يمكن حذف حساب المسؤول الرئيسي" };
    }

    const user = await prisma.user.delete({ where: { id } });

    await logActivity(
      admin.id,
      "تم حذف مستخدم",
      `المستخدم: ${user.name}`
    );

    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    console.error("Delete user error:", error);
    return { success: false, error: "حدث خطأ أثناء حذف المستخدم" };
  }
}
