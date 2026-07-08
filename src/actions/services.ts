"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { serviceSchema, ServiceFormValues } from "@/lib/validations/service";
import { auth } from "@/lib/auth";
import { logActivity } from "@/actions/activity";

export async function getServices(query: string = "") {
  try {
    const services = await prisma.service.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { category: { name: { contains: query } } },
        ],
      },
      include: {
        category: { select: { name: true } },
        documents: {
          orderBy: { displayOrder: "asc" }
        }
      },
      orderBy: { createdAt: "desc" },
    });
    return services;
  } catch (error) {
    console.error("Failed to fetch services:", error);
    return [];
  }
}

export async function getServiceById(id: string) {
  try {
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        category: true,
        documents: {
          orderBy: { displayOrder: "asc" }
        }
      }
    });
    return service;
  } catch (error) {
    console.error("Failed to fetch service:", error);
    return null;
  }
}

export async function createService(data: ServiceFormValues) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const validatedData = serviceSchema.parse(data);
    const { documents, ...serviceData } = validatedData;

    const service = await prisma.service.create({
      data: {
        ...serviceData,
        documents: {
          create: documents?.map((doc, index) => ({
            title: doc.title,
            displayOrder: doc.displayOrder ?? index,
          })) || []
        }
      },
    });

    await logActivity(
      session.user.id,
      "تمت إضافة خدمة جديدة",
      `الخدمة: ${service.name}`
    );

    revalidatePath("/services");
    revalidatePath("/");
    return { success: true, service };
  } catch (error) {
    console.error("Create service error:", error);
    return { success: false, error: "حدث خطأ أثناء إضافة الخدمة" };
  }
}

export async function updateService(id: string, data: ServiceFormValues) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const validatedData = serviceSchema.parse(data);
    const { documents, ...serviceData } = validatedData;

    // Use transaction to delete old documents and insert new ones to easily handle reordering and editing
    const service = await prisma.$transaction(async (tx) => {
      await tx.requiredDocument.deleteMany({
        where: { serviceId: id }
      });

      return await tx.service.update({
        where: { id },
        data: {
          ...serviceData,
          documents: {
            create: documents?.map((doc, index) => ({
              title: doc.title,
              displayOrder: doc.displayOrder ?? index,
            })) || []
          }
        },
      });
    });

    await logActivity(
      session.user.id,
      "تم تعديل بيانات الخدمة",
      `الخدمة: ${service.name}`
    );

    revalidatePath("/services");
    revalidatePath(`/services/${id}`);
    revalidatePath("/");
    return { success: true, service };
  } catch (error) {
    console.error("Update service error:", error);
    return { success: false, error: "حدث خطأ أثناء تعديل الخدمة" };
  }
}

export async function deleteService(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const service = await prisma.service.delete({
      where: { id },
    });

    await logActivity(
      session.user.id,
      "تم حذف الخدمة",
      `الخدمة: ${service.name}`
    );

    revalidatePath("/services");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Delete service error:", error);
    return { success: false, error: "حدث خطأ أثناء حذف الخدمة" };
  }
}
