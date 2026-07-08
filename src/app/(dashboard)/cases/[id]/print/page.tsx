import { notFound } from "next/navigation";
import { getCaseById } from "@/actions/cases";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { caseStatusLabels, casePriorityLabels } from "@/lib/validations/case";

export const dynamic = "force-dynamic";

interface PrintPageProps {
  params: Promise<{ id: string }>;
}

export default async function CasePrintPage(props: PrintPageProps) {
  const { id } = await props.params;
  const c = await getCaseById(id);

  if (!c) notFound();

  const statusLabel = caseStatusLabels[c.status as keyof typeof caseStatusLabels] ?? c.status;
  const priorityLabel = casePriorityLabels[c.priority as keyof typeof casePriorityLabels] ?? c.priority;

  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <title>معاملة {c.caseNumber}</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #111; background: white; direction: rtl; }
          .page { max-width: 800px; margin: 0 auto; padding: 30px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; border-bottom: 2px solid #111; padding-bottom: 16px; }
          .logo-area h1 { font-size: 20px; font-weight: bold; }
          .logo-area p { color: #666; font-size: 12px; }
          .case-num { font-size: 24px; font-weight: bold; color: #1a56db; font-family: monospace; }
          h2 { font-size: 14px; font-weight: bold; background: #f3f4f6; padding: 8px 12px; border-radius: 6px; margin: 20px 0 10px; border-right: 3px solid #1a56db; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
          .field { margin-bottom: 6px; }
          .field .label { color: #666; font-size: 11px; }
          .field .val { font-weight: 600; }
          .doc-item { display: flex; align-items: center; gap: 8px; padding: 6px 10px; border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 6px; }
          .dot { width: 10px; height: 10px; border-radius: 50%; }
          .dot.received { background: #16a34a; }
          .dot.missing { background: #d97706; }
          .fin-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e5e7eb; }
          .fin-row.total { font-weight: bold; font-size: 14px; color: #d97706; border-color: transparent; }
          .notes { white-space: pre-wrap; background: #f9fafb; padding: 12px; border-radius: 6px; font-size: 12px; line-height: 1.7; }
          .footer { margin-top: 30px; text-align: center; color: #666; font-size: 11px; border-top: 1px solid #e5e7eb; padding-top: 14px; }
          @media print { body { print-color-adjust: exact; } }
        `}</style>
      </head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: "window.onload = function(){ window.print(); }" }} />
        <div className="page">
          <div className="header">
            <div className="logo-area">
              <h1>نظام إدارة المكتب</h1>
              <p>ملخص معاملة رسمي</p>
            </div>
            <div style={{ textAlign: "left" }}>
              <div className="case-num">{c.caseNumber}</div>
              <p style={{ fontSize: "11px", color: "#666" }}>
                {format(new Date(c.createdAt), "dd/MM/yyyy HH:mm", { locale: ar })}
              </p>
              <p style={{ marginTop: "4px" }}>
                <span style={{ background: "#dbeafe", color: "#1e40af", padding: "2px 8px", borderRadius: "4px", fontSize: "11px" }}>
                  {statusLabel}
                </span>
              </p>
            </div>
          </div>

          <h2>بيانات العميل</h2>
          <div className="grid">
            <div className="field"><span className="label">الاسم الكامل: </span><span className="val">{c.client.fullName}</span></div>
            <div className="field"><span className="label">رقم الهوية: </span><span className="val">{c.client.nationalId ?? "—"}</span></div>
            <div className="field"><span className="label">رقم الهاتف: </span><span className="val">{c.client.phone}</span></div>
            <div className="field"><span className="label">البريد: </span><span className="val">{c.client.email ?? "—"}</span></div>
            <div className="field"><span className="label">الجنسية: </span><span className="val">{c.client.nationality ?? "—"}</span></div>
            <div className="field"><span className="label">العنوان: </span><span className="val">{c.client.address ?? "—"}</span></div>
          </div>

          <h2>تفاصيل المعاملة</h2>
          <div className="grid">
            <div className="field"><span className="label">الخدمة: </span><span className="val">{c.service.name}</span></div>
            <div className="field"><span className="label">الأولوية: </span><span className="val">{priorityLabel}</span></div>
            <div className="field"><span className="label">تاريخ البداية: </span><span className="val">{c.startDate ? format(new Date(c.startDate), "dd/MM/yyyy", { locale: ar }) : "—"}</span></div>
            <div className="field"><span className="label">تاريخ الاستحقاق: </span><span className="val">{c.dueDate ? format(new Date(c.dueDate), "dd/MM/yyyy", { locale: ar }) : "—"}</span></div>
          </div>

          <h2>المستندات المطلوبة</h2>
          {c.documents.map(doc => (
            <div key={doc.id} className="doc-item">
              <div className={`dot ${doc.received ? "received" : "missing"}`} />
              <span>{doc.title}</span>
              <span style={{ marginRight: "auto", fontSize: "11px", color: doc.received ? "#16a34a" : "#d97706" }}>
                {doc.received ? "مستلم" : "مفقود"}
              </span>
            </div>
          ))}

          <h2>المعلومات المالية</h2>
          <div className="fin-row"><span>الرسوم الإجمالية</span><span>{c.fees.toFixed(2)} دينار</span></div>
          <div className="fin-row"><span>المبلغ المدفوع</span><span style={{ color: "#16a34a" }}>{c.amountPaid.toFixed(2)} دينار</span></div>
          <div className="fin-row total"><span>الرصيد المتبقي</span><span>{c.remainingBalance.toFixed(2)} دينار</span></div>

          {c.notes && (
            <>
              <h2>الملاحظات الداخلية</h2>
              <div className="notes">{c.notes}</div>
            </>
          )}

          <div className="footer">
            <p>وُلِّد هذا المستند تلقائياً من نظام إدارة المكتب — {format(new Date(), "dd/MM/yyyy HH:mm", { locale: ar })}</p>
          </div>
        </div>
      </body>
    </html>
  );
}
