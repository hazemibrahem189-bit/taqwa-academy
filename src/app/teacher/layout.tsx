import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, BookOpen, Users, Calendar } from "lucide-react";

export default async function TeacherLayout({
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

  if (profile?.role !== "teacher") {
    redirect("/login"); // Admin might want to view this, but let's strictly route for now
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-green-800 text-white flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <BookOpen /> <span>Teacher Portal</span>
          </h2>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link href="/teacher" className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-green-700">
            <Users size={20} />
            <span>My Students</span>
          </Link>
          <Link href="/teacher/schedule" className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-green-700">
            <Calendar size={20} />
            <span>Schedule</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-green-700">
          <form action="/auth/signout" method="post">
            <button className="flex items-center space-x-3 px-3 py-2 w-full text-left rounded-md hover:bg-green-700 text-red-200">
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
