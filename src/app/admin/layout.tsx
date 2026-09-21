import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, LayoutDashboard, Users, UserCog, Calendar, Activity } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-green-900 text-white flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold">Admin Portal</h2>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Link href="/admin" className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-green-800">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link href="/admin/teachers" className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-green-800">
            <UserCog size={20} />
            <span>Teachers</span>
          </Link>
          <Link href="/admin/students" className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-green-800">
            <Users size={20} />
            <span>Students</span>
          </Link>
          <Link href="/admin/classes" className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-green-800">
            <Calendar size={20} />
            <span>Classes</span>
          </Link>
          <Link href="/admin/sessions" className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-green-800">
            <Activity size={20} />
            <span>Activity Log</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-green-800">
          <form action="/auth/signout" method="post">
            <button className="flex items-center space-x-3 px-3 py-2 w-full text-left rounded-md hover:bg-green-800 text-red-300 hover:text-red-200">
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
