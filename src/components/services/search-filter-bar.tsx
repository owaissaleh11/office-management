"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
}

interface SearchFilterBarProps {
  categories: Category[];
  totalServices: number;
}

export function SearchFilterBar({ categories, totalServices }: SearchFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const handleCategoryChange = (categoryId: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (categoryId && categoryId !== "all") {
      params.set("category", categoryId);
    } else {
      params.delete("category");
    }
    
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card p-4 rounded-xl border shadow-sm">
      <div className="flex flex-1 items-center space-x-2 space-x-reverse">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="البحث عن خدمة..."
            className="pl-3 pr-9 w-full"
            defaultValue={searchParams.get("query")?.toString() || ""}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="w-full md:w-[200px]">
          <Select 
            defaultValue={searchParams.get("category")?.toString() || "all"} 
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر القسم" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأقسام</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground flex items-center bg-muted/50 px-3 py-1.5 rounded-md">
        <span className="font-medium text-foreground ml-1">{totalServices}</span>
        خدمة متاحة
        {isPending && <span className="mr-2 animate-pulse h-2 w-2 bg-primary rounded-full"></span>}
      </div>
    </div>
  );
}
