"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Log an activity event to the database.
 * Automatically captures the user's IP address.
 */
export async function logActivity(
  userId: string,
  action: string,
  target?: string,
  details?: string
) {
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    // Fallback to "Unknown" if running locally without proxy headers
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0] : (realIp || "Unknown");

    await prisma.activity.create({
      data: {
        userId,
        action,
        target,
        details,
        ipAddress,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

/**
 * Fetch activities for the Reports/Activity Logs page.
 */
export async function getActivities() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const activities = await prisma.activity.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      take: 1000, // Limit for performance, can add pagination later
    });

    return activities;
  } catch (error) {
    console.error("Failed to fetch activities:", error);
    return [];
  }
}
