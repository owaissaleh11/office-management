import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCaseById } from "@/actions/cases";
import { EditCaseForm } from "@/components/cases/edit-case-form";

export const dynamic = "force-dynamic";

interface EditCasePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(props: EditCasePageProps): Promise<Metadata> {
  const { id } = await props.params;
  const c = await getCaseById(id);
  return { title: c ? `تعديل ${c.caseNumber}` : "تعديل المعاملة" };
}

export default async function EditCasePage(props: EditCasePageProps) {
  const { id } = await props.params;
  const c = await getCaseById(id);

  if (!c) notFound();

  return (
    <div className="flex-1 p-4 md:p-8 pt-6">
      <div className="mb-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight">تعديل المعاملة</h1>
        <p className="text-muted-foreground mt-1 font-mono text-sm text-primary">{c.caseNumber}</p>
      </div>

      <EditCaseForm
        caseData={{
          id: c.id,
          caseNumber: c.caseNumber,
          status: c.status,
          priority: c.priority,
          fees: c.fees,
          amountPaid: c.amountPaid,
          notes: c.notes,
          startDate: c.startDate,
          dueDate: c.dueDate,
          documents: c.documents.map(d => ({
            id: d.id,
            title: d.title,
            received: d.received,
            notes: d.notes,
            order: d.order,
          })),
        }}
      />
    </div>
  );
}
