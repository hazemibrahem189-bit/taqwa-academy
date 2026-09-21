import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export default async function AdminClasses() {
  const supabase = await createClient();

  const { data: classes } = await supabase
    .from("classes")
    .select(`
      id,
      student_fee_per_session,
      teacher_payout_per_session,
      students ( full_name ),
      teachers ( profiles ( full_name ) )
    `);

  const { data: students } = await supabase.from("students").select("id, full_name");
  const { data: teachers } = await supabase
    .from("teachers")
    .select("id, profiles (full_name)");

  async function createClass(formData: FormData) {
    "use server";
    const supabaseServer = await createClient();
    
    const student_id = formData.get("student_id") as string;
    const teacher_id = formData.get("teacher_id") as string;
    const student_fee_per_session = parseFloat(formData.get("student_fee") as string);
    const teacher_payout_per_session = parseFloat(formData.get("teacher_payout") as string);

    await supabaseServer.from("classes").insert({
      student_id,
      teacher_id,
      student_fee_per_session,
      teacher_payout_per_session,
    });

    revalidatePath("/admin/classes");
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Class Assignments</h1>

      <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Create New Assignment</h2>
        <form action={createClass} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
            <select name="student_id" required className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="">Select Student</option>
              {students?.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
            <select name="teacher_id" required className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="">Select Teacher</option>
              {teachers?.map(t => <option key={t.id} value={t.id}>{(t.profiles as any)?.full_name}</option>)}
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Student Fee ($)</label>
            <input type="number" step="0.01" name="student_fee" required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Teacher Payout ($)</label>
            <input type="number" step="0.01" name="teacher_payout" required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>

          <div className="md:col-span-1">
            <button type="submit" className="w-full bg-green-700 text-white py-2 px-4 rounded-md hover:bg-green-800 transition-colors">
              Assign
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee / Payout</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {classes?.map((c: any) => (
              <tr key={c.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.students?.full_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.teachers?.profiles?.full_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="text-green-600 font-semibold">${c.student_fee_per_session}</span> / <span className="text-orange-600 font-semibold">${c.teacher_payout_per_session}</span>
                </td>
              </tr>
            ))}
            {(!classes || classes.length === 0) && (
              <tr>
                <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">No classes assigned yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
