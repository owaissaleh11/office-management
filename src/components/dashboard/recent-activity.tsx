"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Clock, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { arSA } from "date-fns/locale";

type ActivityItem = {
  id: string;
  action: string;
  target: string | null;
  createdAt: Date;
  user: {
    name: string;
    image: string | null;
  };
};

export function RecentActivity({ activities }: { activities: ActivityItem[] }) {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          النشاط الأخير
        </CardTitle>
        <CardDescription>آخر الأنشطة والتحديثات في النظام</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">لا توجد أنشطة حديثة</p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              ستظهر الأنشطة هنا بمجرد بدء استخدام النظام
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {activities.map((activity, index) => (
              <div key={activity.id} className="relative flex gap-4">
                {/* Timeline line */}
                {index !== activities.length - 1 && (
                  <div className="absolute start-[15px] top-[30px] bottom-[-24px] w-[2px] bg-muted" />
                )}
                
                <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle className="h-4 w-4" />
                </div>
                
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">
                      {activity.user.name}{" "}
                      <span className="font-normal text-muted-foreground">
                        {activity.action}
                      </span>
                    </p>
                    <time className="text-xs text-muted-foreground">
                      {formatDistanceToNow(activity.createdAt, {
                        addSuffix: true,
                        locale: arSA,
                      })}
                    </time>
                  </div>
                  {activity.target && (
                    <p className="text-sm text-muted-foreground">
                      {activity.target}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
