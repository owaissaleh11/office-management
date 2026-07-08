"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export function ClientsSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const query = searchParams.get("query") ?? "";

  const handleChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("query", value);
      } else {
        params.delete("query");
      }
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, router, searchParams]
  );

  const handleClear = () => handleChange("");

  return (
    <div className="relative flex-1 max-w-sm">
      <Search
        className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-colors ${
          isPending ? "text-primary animate-pulse" : "text-muted-foreground"
        }`}
      />
      <Input
        placeholder="ابحث بالاسم أو رقم الهاتف..."
        defaultValue={query}
        onChange={e => handleChange(e.target.value)}
        className="pr-9 pl-9"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
