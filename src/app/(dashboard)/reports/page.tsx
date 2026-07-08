import { Metadata } from "next";
import { getActivities } from "@/actions/activity";
import { DataTable } from "@/components/activities/data-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "سجل النشاطات",
  description: "عرض كافة نشاطات النظام والعمليات",
};

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  try {
    const activities = await getActivities();

    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">سجل النشاطات</h2>
            <p className="text-muted-foreground mt-2">
              تتبع جميع العمليات التي تمت على النظام، حصرياً للمدراء.
            </p>
          </div>
        </div>
        <div className="flex flex-col space-y-8">
          <DataTable data={activities} />
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>غير مصرح</AlertTitle>
          <AlertDescription>
            هذه الصفحة مخصصة للمدراء فقط. لا تملك صلاحية الوصول إلى سجل النشاطات.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
}
