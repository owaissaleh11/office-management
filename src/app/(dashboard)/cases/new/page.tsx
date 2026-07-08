import { Metadata } from "next";
import { getServices } from "@/actions/services";
import { getCases } from "@/actions/cases";
import { CaseWizard } from "@/components/cases/case-wizard";

export const metadata: Metadata = {
  title: "معاملة جديدة",
  description: "إنشاء معاملة عميل جديدة",
};

export const dynamic = "force-dynamic";

async function getNextCaseNumber() {
  const year = new Date().getFullYear();
  const count = await getCases({ query: "" });
  const yearCases = count.filter(c => c.caseNumber.startsWith(`${year}-`));
  const seq = String(yearCases.length + 1).padStart(4, "0");
  return `${year}-${seq}`;
}

export default async function NewCasePage() {
  const [services, nextCaseNumber] = await Promise.all([
    getServices(),
    getNextCaseNumber(),
  ]);

  const activeServices = services.filter(s => s.status === "ACTIVE");

  return (
    <div className="flex-1 p-4 md:p-8 pt-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">معاملة جديدة</h1>
        <p className="text-muted-foreground mt-1">أنشئ معاملة عميل جديدة باتباع الخطوات التالية</p>
      </div>

      <CaseWizard
        services={activeServices.map(s => ({
          id: s.id,
          name: s.name,
          fees: s.fees,
          processingTime: s.processingTime,
          status: s.status,
          category: { name: s.category.name },
          documents: s.documents.map(d => ({ id: d.id, title: d.title })),
        }))}
        nextCaseNumber={nextCaseNumber}
      />
    </div>
  );
}
