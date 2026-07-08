"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Building2, Server, Activity as ActivityIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsProps {
  totalUsers: number;
  totalCategories: number;
  totalServices: number;
  recentActivitiesCount: number;
}

export function StatsCards({ stats }: { stats: StatsProps }) {
  const cards = [
    {
      title: "إجمالي الموظفين",
      value: stats.totalUsers,
      description: "المسجلين في النظام",
      icon: Users,
      trend: null,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      hover: "group-hover:bg-blue-500 group-hover:text-white",
      gradient: "from-blue-500/60 via-blue-500/20",
    },
    {
      title: "إجمالي الأقسام",
      value: stats.totalCategories,
      description: "الأقسام المتاحة",
      icon: Building2,
      trend: null,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      hover: "group-hover:bg-emerald-500 group-hover:text-white",
      gradient: "from-emerald-500/60 via-emerald-500/20",
    },
    {
      title: "إجمالي الخدمات",
      value: stats.totalServices,
      description: "الخدمات النشطة",
      icon: Server,
      trend: null,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
      hover: "group-hover:bg-violet-500 group-hover:text-white",
      gradient: "from-violet-500/60 via-violet-500/20",
    },
    {
      title: "النشاط الأخير",
      value: stats.recentActivitiesCount,
      description: "إجراءات في آخر 24 ساعة",
      icon: ActivityIcon,
      trend: null,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      hover: "group-hover:bg-orange-500 group-hover:text-white",
      gradient: "from-orange-500/60 via-orange-500/20",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((stat) => (
        <Card
          key={stat.title}
          className="group relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div
              className={cn(
                "rounded-lg p-2 transition-colors duration-300",
                stat.color,
                stat.bg,
                stat.hover
              )}
            >
              <stat.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stat.value}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
          {/* Decorative gradient line */}
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-l to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100",
              stat.gradient
            )}
          />
        </Card>
      ))}
    </div>
  );
}
