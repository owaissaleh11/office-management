import { Metadata } from "next";
import { getUsers } from "@/actions/users";
import { DataTable } from "@/components/users/data-table";

export const metadata: Metadata = {
  title: "الموظفون",
  description: "إدارة كافة المستخدمين والموظفين في النظام",
};

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">الموظفون (المستخدمون)</h2>
      </div>
      <div className="hidden md:flex flex-col space-y-8">
        <DataTable data={users as any} />
      </div>
      <div className="md:hidden flex flex-col space-y-8">
         <DataTable data={users as any} />
      </div>
    </div>
  );
}
