import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  ChevronRight, User, Briefcase, FileText, Banknote,
  Clock, Phone, Mail, MapPin, Globe, CalendarDays, Printer, Pencil
} from "lucide-react";
import { getCaseById } from "@/actions/cases";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CaseStatusBadge } from "@/components/cases/case-status-badge";
import { CasePriorityBadge } from "@/components/cases/case-priority-badge";
import { CaseTimeline } from "@/components/cases/case-timeline";
import { CaseDocumentsSection } from "@/components/cases/case-documents-section";

export const dynamic = "force-dynamic";

interface CasePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(props: CasePageProps): Promise<Metadata> {
  const { id } = await props.params;
  const c = await getCaseById(id);
  return { title: c ? `معاملة ${c.caseNumber}` : "معاملة" };
}

export default async function CaseDetailsPage(props: CasePageProps) {
  const { id } = await props.params;
  const c = await getCaseById(id);

  if (!c) notFound();

  const infoRow = (icon: React.ReactNode, label: string, value: string | null | undefined) =>
    value ? (
      <div className="flex items-start gap-3">
        <div className="text-muted-foreground mt-0.5 shrink-0">{icon}</div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-medium">{value}</p>
        </div>
      </div>
    ) : null;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/cases"
            className={buttonVariants({ variant: "outline", size: "icon" })}
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight font-mono text-primary">{c.caseNumber}</h1>
              <CaseStatusBadge status={c.status} />
              <CasePriorityBadge priority={c.priority} />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {c.client.fullName} — {c.service.name}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/cases/${c.id}/print`}
            target="_blank"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Printer className="h-4 w-4 me-2" /> طباعة
          </Link>
          <Link
            href={`/cases/${c.id}/edit`}
            className={buttonVariants({ size: "sm" })}
          >
            <Pencil className="h-4 w-4 me-2" /> تعديل
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Info */}
          <Card>
            <CardHeader className="bg-muted/30 border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-primary" /> بيانات العميل
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {infoRow(<User className="h-4 w-4" />, "الاسم الكامل", c.client.fullName)}
              {infoRow(<FileText className="h-4 w-4" />, "رقم الهوية / جواز السفر", c.client.nationalId)}
              {infoRow(<Phone className="h-4 w-4" />, "رقم الهاتف", c.client.phone)}
              {infoRow(<Mail className="h-4 w-4" />, "البريد الإلكتروني", c.client.email)}
              {infoRow(<Globe className="h-4 w-4" />, "الجنسية", c.client.nationality)}
              {infoRow(<MapPin className="h-4 w-4" />, "العنوان", c.client.address)}
              {infoRow(<CalendarDays className="h-4 w-4" />, "تاريخ الميلاد",
                c.client.birthDate ? format(new Date(c.client.birthDate), "dd/MM/yyyy", { locale: ar }) : null
              )}
            </CardContent>
          </Card>

          {/* Case Info */}
          <Card>
            <CardHeader className="bg-muted/30 border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Briefcase className="h-4 w-4 text-primary" /> تفاصيل المعاملة
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {infoRow(<Briefcase className="h-4 w-4" />, "الخدمة", c.service.name)}
              {infoRow(<FileText className="h-4 w-4" />, "القسم", c.service.category.name)}
              {infoRow(<Clock className="h-4 w-4" />, "تاريخ البداية",
                c.startDate ? format(new Date(c.startDate), "dd/MM/yyyy", { locale: ar }) : "—"
              )}
              {infoRow(<Clock className="h-4 w-4" />, "تاريخ الاستحقاق",
                c.dueDate ? format(new Date(c.dueDate), "dd/MM/yyyy", { locale: ar }) : "—"
              )}
              {infoRow(<CalendarDays className="h-4 w-4" />, "تاريخ الإنشاء",
                format(new Date(c.createdAt), "dd/MM/yyyy HH:mm", { locale: ar })
              )}
            </CardContent>
          </Card>

          {/* Documents Section (interactive) */}
          <CaseDocumentsSection caseId={c.id} documents={c.documents as any} />

          {/* Notes */}
          {c.notes && (
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-primary">
                  <FileText className="h-4 w-4" /> الملاحظات الداخلية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-loose whitespace-pre-wrap">{c.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Financial */}
          <Card className="overflow-hidden">
            <div className="bg-primary p-5 text-primary-foreground text-center space-y-1">
              <Banknote className="h-8 w-8 mx-auto opacity-75" />
              <p className="text-sm opacity-80">الرسوم الإجمالية</p>
              <p className="text-3xl font-bold">{c.fees.toFixed(2)}</p>
              <p className="text-sm opacity-80">دينار</p>
            </div>
            <CardContent className="pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">المدفوع</span>
                <span className="font-semibold text-green-600">{c.amountPaid.toFixed(2)} د</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">المتبقي</span>
                <span className={`font-semibold ${c.remainingBalance > 0 ? "text-amber-600" : "text-green-600"}`}>
                  {c.remainingBalance.toFixed(2)} د
                </span>
              </div>
              {c.remainingBalance <= 0 && (
                <Badge className="w-full justify-center bg-green-500/15 text-green-700 border-green-200">
                  ✓ تم السداد الكامل
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader className="bg-muted/30 border-b pb-4">
              <CardTitle className="text-base">سجل الأحداث</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <CaseTimeline events={c.timeline as any} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
