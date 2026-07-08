import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServiceById } from "@/actions/services";
import { DocumentChecklist } from "@/components/services/document-checklist";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ServiceActions } from "@/components/services/service-actions";
import { ChevronRight, Clock, Banknote, Info, Paperclip, FileText } from "lucide-react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "تفاصيل الخدمة",
  description: "عرض تفاصيل الخدمة",
};

interface ServiceDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ServiceDetailsPage(props: ServiceDetailsPageProps) {
  const params = await props.params;
  const service = await getServiceById(params.id);

  if (!service) {
    notFound();
  }

  const isActive = service.status === "ACTIVE";

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-5xl mx-auto w-full">
      <div className="flex flex-col space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/services">الخدمات</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{service.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-4">
          <Link href="/services" className={buttonVariants({ variant: "outline", size: "icon", className: "shrink-0" })}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">عودة للخدمات</span>
          </Link>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{service.name}</h1>
              <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-green-500/15 text-green-700 border-green-200" : ""}>
                {isActive ? "نشط" : service.status === "INACTIVE" ? "غير نشط" : "مؤرشف"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{service.category.name}</p>
          </div>
          
          {/* Action Buttons: Edit and Delete */}
          <ServiceActions service={service} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="bg-muted/30 pb-4 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                وصف الخدمة
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm leading-loose text-foreground whitespace-pre-wrap">
                {service.description || "لا يوجد وصف لهذه الخدمة."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-muted/30 pb-4 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Paperclip className="h-5 w-5 text-primary" />
                المستندات المطلوبة
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <DocumentChecklist documents={service.documents} />
            </CardContent>
          </Card>

          {service.notes && (
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-primary">
                  <Info className="h-5 w-5" />
                  ملاحظات هامة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                  {service.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="bg-primary p-6 text-primary-foreground text-center space-y-2">
              <Banknote className="h-8 w-8 mx-auto opacity-80" />
              <h3 className="font-medium text-primary-foreground/80">رسوم الخدمة</h3>
              <div className="text-3xl font-bold">{service.fees > 0 ? `${service.fees} دينار` : "مجانية"}</div>
            </div>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                الوقت المستغرق
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="font-medium">
                {service.processingTime || "غير محدد"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
