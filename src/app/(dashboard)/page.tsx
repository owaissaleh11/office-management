import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Fetch real data from the database
  const [totalUsers, totalCategories, totalServices, recentActivities] = await Promise.all([
    prisma.user.count(),
    prisma.category.count(),
    prisma.service.count(),
    prisma.activity.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, image: true } },
      },
    }),
  ]);

  const stats = {
    totalUsers,
    totalCategories,
    totalServices,
    recentActivitiesCount: recentActivities.length,
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">لوحة التحكم</h1>
          <Badge variant="secondary" className="text-xs">
            نظرة عامة
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          مرحباً بك في نظام إدارة المكتب. يمكنك متابعة جميع الأنشطة من هنا.
        </p>
      </div>

      {/* ── Stats Cards ── */}
      <StatsCards stats={stats} />

      {/* ── Quick Actions / Activity ── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <RecentActivity activities={recentActivities} />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              المهام السريعة
            </CardTitle>
            <CardDescription>إجراءات سريعة لإدارة النظام</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <CheckCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                لا توجد مهام معلقة
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                سيتم إضافة المهام مع الوحدات القادمة
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
