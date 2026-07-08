import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center p-8">
      <EmptyState
        icon={FileQuestion}
        title="الصفحة غير موجودة"
        description="عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها."
        action={
          <Link href="/">
            <Button className="mt-6">العودة إلى لوحة القيادة</Button>
          </Link>
        }
        className="border-none"
      />
    </div>
  );
}
