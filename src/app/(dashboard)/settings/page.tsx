import { Metadata } from "next";
import { getSettings } from "@/actions/settings";
import { SettingsForm } from "@/components/settings/settings-form";
import { auth } from "@/lib/auth";
import { Settings } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "الإعدادات",
  description: "تكوين إعدادات النظام",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();


  const settings = await getSettings();

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">إعدادات النظام</h1>
            <p className="text-sm text-muted-foreground">
              إدارة الإعدادات والتفضيلات لبيانات المكتب الأساسية
            </p>
          </div>
        </div>
      </div>

      <Separator />

      <div className="max-w-4xl">
        <SettingsForm initialData={settings} />
      </div>
    </div>
  );
}
