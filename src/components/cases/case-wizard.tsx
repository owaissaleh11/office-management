"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Step1SelectService } from "./step1-select-service";
import { Step2ClientInfo } from "./step2-client-info";
import { Step3CaseInfo } from "./step3-case-info";
import { Step4Documents, DocumentItem } from "./step4-documents";
import { Step5Financial } from "./step5-financial";
import { Step6Notes } from "./step6-notes";
import { clientSchema, ClientFormValues } from "@/lib/validations/client";
import { createClient, findClientByNationalId } from "@/actions/clients";
import { createCase } from "@/actions/cases";

interface Service {
  id: string;
  name: string;
  fees: number;
  processingTime: string | null;
  status: string;
  category: { name: string };
  documents: { id: string; title: string }[];
}

const STEPS = [
  { label: "الخدمة", description: "اختر نوع الخدمة" },
  { label: "العميل", description: "بيانات العميل" },
  { label: "المعاملة", description: "تفاصيل المعاملة" },
  { label: "المستندات", description: "المستندات المطلوبة" },
  { label: "المالية", description: "الرسوم والمدفوعات" },
  { label: "الملاحظات", description: "ملاحظات إضافية" },
];

interface CaseWizardProps {
  services: Service[];
  nextCaseNumber: string;
}

export function CaseWizard({ services, nextCaseNumber }: CaseWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Step 2
  const [existingClientId, setExistingClientId] = useState<string | null>(null);
  const clientForm = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: { fullName: "", phone: "", email: "", nationalId: "", address: "", nationality: "", birthDate: "" },
  });

  // Step 3
  const [status, setStatus] = useState("NEW");
  const [priority, setPriority] = useState("MEDIUM");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");

  // Step 4
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  // Step 5
  const [fees, setFees] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);

  // Step 6
  const [notes, setNotes] = useState("");

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setFees(service.fees);
    setDocuments(service.documents.map((d, i) => ({ title: d.title, received: false, notes: "", order: i })));
  };

  const handleClientNationalIdBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const nationalId = e.target.value;
    if (!nationalId) return;
    const existing = await findClientByNationalId(nationalId);
    if (existing) {
      setExistingClientId(existing.id);
      clientForm.setValue("fullName", existing.fullName);
      clientForm.setValue("phone", existing.phone);
      clientForm.setValue("nationalId", existing.nationalId ?? "");
      clientForm.setValue("email", existing.email ?? "");
      clientForm.setValue("address", existing.address ?? "");
      clientForm.setValue("nationality", existing.nationality ?? "");
      toast.info(`تم العثور على عميل موجود: ${existing.fullName}`);
    } else {
      setExistingClientId(null);
    }
  };

  const canGoNext = (): boolean => {
    if (step === 0) return !!selectedService;
    return true;
  };

  const handleNext = async () => {
    if (step === 1) {
      const valid = await clientForm.trigger();
      if (!valid) return;
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Create or reuse client
      let clientId = existingClientId;
      if (!clientId) {
        const clientData = clientForm.getValues();
        const clientRes = await createClient(clientData);
        if (!clientRes.success || !clientRes.client) {
          toast.error(clientRes.error || "فشل إنشاء بيانات العميل");
          return;
        }
        clientId = clientRes.client.id;
      }

      const caseRes = await createCase({
        clientId,
        serviceId: selectedService!.id,
        status: status as any,
        priority: priority as any,
        fees,
        amountPaid,
        notes,
        startDate,
        dueDate,
        documents,
      });

      if (!caseRes.success || !caseRes.case) {
        toast.error(caseRes.error || "فشل إنشاء المعاملة");
        return;
      }

      toast.success("تم إنشاء المعاملة بنجاح!");
      router.push(`/cases/${caseRes.case.id}`);
    } catch {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                i === step ? "bg-primary text-primary-foreground shadow-md" :
                  i < step ? "bg-primary/15 text-primary hover:bg-primary/25 cursor-pointer" :
                    "bg-muted text-muted-foreground cursor-default"
              )}
            >
              <span className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold",
                i === step ? "bg-primary-foreground text-primary" :
                  i < step ? "bg-primary text-primary-foreground" : "bg-muted-foreground/30"
              )}>
                {i + 1}
              </span>
              <span className="hidden md:inline">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={cn("h-px w-4 shrink-0", i < step ? "bg-primary" : "bg-border")} />
            )}
          </div>
        ))}
      </div>

      {/* Step card */}
      <Card>
        <CardHeader className="border-b bg-muted/30">
          <CardTitle>{STEPS[step].label}</CardTitle>
          <CardDescription>{STEPS[step].description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {step === 0 && (
            <Step1SelectService
              services={services}
              selectedId={selectedService?.id ?? ""}
              onSelect={handleServiceSelect}
            />
          )}
          {step === 1 && (
            <div onBlurCapture={(e: any) => {
              if (e.target.id === "nationalId") handleClientNationalIdBlur(e);
            }}>
              <Step2ClientInfo
                form={clientForm}
                existingClient={existingClientId ? { id: existingClientId, fullName: clientForm.getValues("fullName"), phone: clientForm.getValues("phone") } : null}
              />
            </div>
          )}
          {step === 2 && (
            <Step3CaseInfo
              caseNumber={nextCaseNumber}
              status={status}
              priority={priority}
              startDate={startDate}
              dueDate={dueDate}
              onStatusChange={setStatus}
              onPriorityChange={setPriority}
              onStartDateChange={setStartDate}
              onDueDateChange={setDueDate}
            />
          )}
          {step === 3 && <Step4Documents documents={documents} onChange={setDocuments} />}
          {step === 4 && (
            <Step5Financial
              fees={fees}
              amountPaid={amountPaid}
              onFeesChange={setFees}
              onAmountPaidChange={setAmountPaid}
            />
          )}
          {step === 5 && <Step6Notes notes={notes} onChange={setNotes} />}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => step > 0 ? setStep(s => s - 1) : router.back()}
        >
          <ChevronRight className="h-4 w-4 me-2" />
          {step === 0 ? "إلغاء" : "السابق"}
        </Button>

        {step < STEPS.length - 1 ? (
          <Button onClick={handleNext} disabled={!canGoNext()}>
            التالي
            <ChevronLeft className="h-4 w-4 ms-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
            حفظ المعاملة
          </Button>
        )}
      </div>
    </div>
  );
}
