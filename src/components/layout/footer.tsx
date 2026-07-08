import { appConfig } from "@/config/navigation";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/50 px-6 py-4">
      <div className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
        <p>
          © {currentYear} {appConfig.name}. جميع الحقوق محفوظة.
        </p>
        <p className="text-muted-foreground/60">
          الإصدار {appConfig.version}
        </p>
      </div>
    </footer>
  );
}
