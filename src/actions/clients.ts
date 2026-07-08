"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { clientSchema, ClientFormValues } from "@/lib/validations/client";

export async function getClients(query: string = "") {
  try {
    return await prisma.client.findMany({
      where: query ? {
        OR: [
          { fullName: { contains: query } },
          { nationalId: { contains: query } },
          { phone: { contains: query } },
        ],
      } : undefined,
      include: {
        _count: { select: { cases: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch clients:", error);
    return [];
  }
}

export async function getClientsWithCases(query: string = "") {
  try {
    return await prisma.client.findMany({
      where: query ? {
        OR: [
          { fullName: { contains: query } },
          { nationalId: { contains: query } },
          { phone: { contains: query } },
        ],
      } : undefined,
      include: {
        _count: { select: { cases: true } },
        cases: {
          include: {
            service: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch clients with cases:", error);
    return [];
  }
}

export async function getClientById(id: string) {
  try {
    return await prisma.client.findUnique({
      where: { id },
      include: {
        cases: {
          include: {
            service: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch client:", error);
    return null;
  }
}

export async function findClientByNationalId(nationalId: string) {
  try {
    if (!nationalId) return null;
    return await prisma.client.findUnique({
      where: { nationalId },
      include: {
        cases: {
          include: { service: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });
  } catch {
    return null;
  }
}

export async function createClient(data: ClientFormValues) {
  try {
    const validated = clientSchema.parse(data);
    const client = await prisma.client.create({
      data: {
        ...validated,
        email: validated.email || null,
        birthDate: validated.birthDate ? new Date(validated.birthDate) : null,
        nationalId: validated.nationalId || null,
      },
    });
    revalidatePath("/clients");
    return { success: true, client };
  } catch (error) {
    console.error("Create client error:", error);
    return { success: false, error: "حدث خطأ أثناء إضافة العميل" };
  }
}

export async function updateClient(id: string, data: ClientFormValues) {
  try {
    const validated = clientSchema.parse(data);
    const client = await prisma.client.update({
      where: { id },
      data: {
        ...validated,
        email: validated.email || null,
        birthDate: validated.birthDate ? new Date(validated.birthDate) : null,
        nationalId: validated.nationalId || null,
      },
    });
    revalidatePath("/clients");
    revalidatePath(`/clients/${id}`);
    return { success: true, client };
  } catch (error) {
    console.error("Update client error:", error);
    return { success: false, error: "حدث خطأ أثناء تعديل بيانات العميل" };
  }
}
