"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center p-8">
      <EmptyState
        icon={AlertTriangle}
        title="حدث خطأ غير متوقع"
        description="نعتذر، واجه النظام مشكلة أثناء معالجة طلبك. يرجى المحاولة مرة أخرى."
        action={
          <div className="flex space-x-4 space-x-reverse mt-6">
            <Button onClick={() => reset()}>إعادة المحاولة</Button>
            <Button variant="outline" onClick={() => window.location.href = "/"}>العودة للرئيسية</Button>
          </div>
        }
        className="border-none"
      />
    </div>
  );
}
