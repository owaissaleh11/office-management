import { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { CasesTable } from "@/components/cases/cases-table";
import { CaseFilters } from "@/components/cases/case-filters";
import { getCases } from "@/actions/cases";
import { getServices } from "@/actions/services";

export const metadata: Metadata = {
  title: "المعاملات",
  description: "أرشيف جميع معاملات العملاء",
};

export const dynamic = "force-dynamic";

interface CasesPageProps {
  searchParams: Promise<{
    query?: string;
    status?: string;
    priority?: string;
    serviceId?: string;
    sort?: "newest" | "oldest" | "alpha";
  }>;
}

export default async function CasesPage(props: CasesPageProps) {
  const searchParams = await props.searchParams;

  const [cases, services] = await Promise.all([
    getCases({
      query: searchParams.query,
      status: searchParams.status,
      priority: searchParams.priority,
      serviceId: searchParams.serviceId,
      sort: searchParams.sort,
    }),
    getServices(),
  ]);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">المعاملات</h1>
          <p className="text-muted-foreground mt-1">أرشيف شامل لجميع معاملات العملاء وتتبع حالاتها</p>
        </div>
        <Link href="/cases/new" className={buttonVariants()}>
          <Plus className="h-4 w-4 me-2" />
          معاملة جديدة
        </Link>
      </div>

      <CaseFilters services={services.map(s => ({ id: s.id, name: s.name }))} totalCount={cases.length} />

      <CasesTable cases={cases as any} />
    </div>
  );
}
