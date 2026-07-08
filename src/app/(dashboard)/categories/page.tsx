import { Metadata } from "next";
import { getCategories } from "@/actions/categories";
import { DataTable } from "@/components/categories/data-table";

export const metadata: Metadata = {
  title: "الأقسام",
  description: "إدارة كافة أقسام المكتب",
};

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">الأقسام</h2>
      </div>
      <div className="hidden md:flex flex-col space-y-8">
        <DataTable data={categories} />
      </div>
      <div className="md:hidden flex flex-col space-y-8">
         <DataTable data={categories} />
      </div>
    </div>
  );
}
