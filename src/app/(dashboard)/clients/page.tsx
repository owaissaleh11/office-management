import { Metadata } from "next";
import { Suspense } from "react";
import { Users } from "lucide-react";
import { getClientsWithCases } from "@/actions/clients";
import { EmptyState } from "@/components/ui/empty-state";
import { ClientsAccordion } from "@/components/clients/clients-accordion";
import { ClientsSearch } from "@/components/clients/clients-search";

export const metadata: Metadata = {
  title: "العملاء",
  description: "قائمة جميع العملاء ومعاملاتهم",
};

export const dynamic = "force-dynamic";

interface ClientsPageProps {
  searchParams: Promise<{ query?: string }>;
}

export default async function ClientsPage(props: ClientsPageProps) {
  const searchParams = await props.searchParams;
  const clients = await getClientsWithCases(searchParams.query ?? "");

  // Group duplicate client records by phone number
  // (same person can be saved multiple times; merge their cases)
  const grouped = new Map<string, (typeof clients)[number] & { allIds: string[] }>();

  for (const client of clients) {
    const key = client.phone?.trim() || client.id; // fallback to id if no phone
    if (grouped.has(key)) {
      const existing = grouped.get(key)!;
      existing.cases = [...existing.cases, ...client.cases];
      existing._count.cases = existing.cases.length;
      existing.allIds.push(client.id);
    } else {
      grouped.set(key, { ...client, allIds: [client.id] });
    }
  }

  const mergedClients = Array.from(grouped.values());

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">العملاء</h1>
        <p className="text-muted-foreground mt-1">
          اضغط على اسم العميل لعرض معاملاته
        </p>
      </div>

      <div className="flex gap-3">
        <Suspense fallback={<div className="h-10 w-64 animate-pulse rounded-md bg-muted" />}>
          <ClientsSearch />
        </Suspense>
        <span className="flex items-center text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-md">
          <span className="font-semibold text-foreground ml-1">{mergedClients.length}</span> عميل
        </span>
      </div>

      {mergedClients.length === 0 ? (
        <EmptyState
          title="لا يوجد عملاء"
          description="لم يتم تسجيل أي عملاء بعد."
          icon={Users}
        />
      ) : (
        <ClientsAccordion clients={mergedClients as any} />
      )}
    </div>
  );
}
