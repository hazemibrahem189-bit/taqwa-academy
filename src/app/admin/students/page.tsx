import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export default async function AdminStudents() {
  const supabase = await createClient();

  const { data: students } = await supabase.from("students").select("*").order("created_at", { ascending: false });

  async function createStudent(formData: FormData) {
    "use server";
    const supabaseServer = await createClient();
    
    const full_name = formData.get("full_name") as string;
    const parent_email = formData.get("parent_email") as string;

    await supabaseServer.from("students").insert({
      full_name,
      parent_email,
    });

    revalidatePath("/admin/students");
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Manage Students</h1>

      <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Add New Student</h2>
        <form action={createStudent} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Student Full Name</label>
            <input type="text" name="full_name" required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Parent Email</label>
            <input type="email" name="parent_email" required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>

          <div className="md:col-span-1">
            <button type="submit" className="w-full bg-green-700 text-white py-2 px-4 rounded-md hover:bg-green-800 transition-colors">
              Add Student
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Access Link</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students?.map((s: any) => (
              <tr key={s.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.full_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.parent_email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <a href={`/student/${s.access_token}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    View Portal
                  </a>
                </td>
              </tr>
            ))}
            {(!students || students.length === 0) && (
              <tr>
                <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">No students found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
