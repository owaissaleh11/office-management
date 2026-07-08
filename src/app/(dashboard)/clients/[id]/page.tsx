import { Metadata } from "next";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { ChevronRight, Phone, Mail, MapPin, Globe, CalendarDays, FileText, Plus } from "lucide-react";
import { getClientById } from "@/actions/clients";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientHistory } from "@/components/cases/client-history";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface ClientPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(props: ClientPageProps): Promise<Metadata> {
  const { id } = await props.params;
  const client = await getClientById(id);
  return { title: client ? client.fullName : "بيانات العميل" };
}

export default async function ClientProfilePage(props: ClientPageProps) {
  const { id } = await props.params;
  const client = await getClientById(id);

  if (!client) notFound();

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/clients" className={buttonVariants({ variant: "outline", size: "icon" })}>
          <ChevronRight className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{client.fullName}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {client.cases.length} معاملة مسجلة
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Client Info */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="bg-muted/30 border-b pb-4">
              <div className="flex items-center justify-center mb-3">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-2xl">{client.fullName.charAt(0)}</span>
                </div>
              </div>
              <CardTitle className="text-center text-base">{client.fullName}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {client.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{client.phone}</span>
                </div>
              )}
              {client.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{client.email}</span>
                </div>
              )}
              {client.nationalId && (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{client.nationalId}</span>
                </div>
              )}
              {client.nationality && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span>{client.nationality}</span>
                </div>
              )}
              {client.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{client.address}</span>
                </div>
              )}
              {client.birthDate && (
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(client.birthDate), "dd/MM/yyyy", { locale: ar })}</span>
                </div>
              )}
              <div className="pt-2 border-t text-xs text-muted-foreground">
                عميل منذ {format(new Date(client.createdAt), "dd MMMM yyyy", { locale: ar })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Case History */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="bg-muted/30 border-b pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">سجل المعاملات</CardTitle>
                <Link
                  href={`/cases/new`}
                  className={buttonVariants({ size: "sm", variant: "outline" })}
                >
                  <Plus className="h-4 w-4 me-2" /> معاملة جديدة
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <ClientHistory cases={client.cases} clientName={client.fullName} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
