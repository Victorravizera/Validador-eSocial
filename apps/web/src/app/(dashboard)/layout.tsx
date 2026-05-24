import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "../../components/layout/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  if (!store.get("esocial_qa_key")) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}