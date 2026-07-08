import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ServiceCardProps {
  id: string;
  name: string;
  category: string;
  description: string | null;
  status: string;
}

export function ServiceCard({ id, name, category, description, status }: ServiceCardProps) {
  const isActive = status === "ACTIVE";

  return (
    <Link href={`/services/${id}`} className="group block h-full">
      <div className="flex h-full flex-col justify-between rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <h3 className="font-semibold text-lg leading-tight tracking-tight group-hover:text-primary transition-colors">
                {name}
              </h3>
              <p className="text-xs font-medium text-muted-foreground">{category}</p>
            </div>
            <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-green-500/15 text-green-700 hover:bg-green-500/25 border-green-200" : ""}>
              {isActive ? "نشط" : status === "INACTIVE" ? "غير نشط" : "مؤرشف"}
            </Badge>
          </div>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        
        <div className="mt-6 flex items-center text-sm font-medium text-primary">
          <span>التفاصيل</span>
          <ChevronLeft className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
