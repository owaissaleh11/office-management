import { Metadata } from "next";
import { getServices } from "@/actions/services";
import { getCategories } from "@/actions/categories";
import { ServiceCard } from "@/components/services/service-card";
import { SearchFilterBar } from "@/components/services/search-filter-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ServiceFormDialog } from "@/components/services/service-form-dialog";

export const metadata: Metadata = {
  title: "الخدمات",
  description: "إدارة كافة خدمات المكتب",
};

export const dynamic = "force-dynamic";

interface ServicesPageProps {
  searchParams: Promise<{ query?: string; category?: string }>;
}

export default async function ServicesPage(props: ServicesPageProps) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const categoryFilter = searchParams?.category || "all";

  // Fetch all services based on search query
  let services = await getServices(query);

  // Filter by category if selected
  if (categoryFilter !== "all") {
    services = services.filter((s) => s.categoryId === categoryFilter);
  }

  // Fetch categories for the filter
  const categories = await getCategories();

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">الخدمات</h2>
          <p className="text-muted-foreground mt-1">تصفح وإدارة خدمات المكتب المتاحة للعملاء</p>
        </div>
        <ServiceFormDialog />
      </div>

      <SearchFilterBar categories={categories} totalServices={services.length} />

      {services.length === 0 ? (
        <EmptyState
          title="لا توجد خدمات"
          description={
            query || categoryFilter !== "all"
              ? "لم يتم العثور على خدمات مطابقة للبحث."
              : "لم يتم إضافة أي خدمات حتى الآن."
          }
          icon={Plus}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              id={service.id}
              name={service.name}
              category={service.category.name}
              description={service.description}
              status={service.status}
            />
          ))}
        </div>
      )}
    </div>
  );
}
