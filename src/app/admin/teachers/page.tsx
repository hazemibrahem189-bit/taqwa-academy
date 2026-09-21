import { createClient } from "@/utils/supabase/server";

export default async function AdminTeachers() {
  const supabase = await createClient();

  const { data: teachers } = await supabase
    .from("teachers")
    .select(`
      id,
      bio,
      profiles ( email, full_name )
    `);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Teachers</h1>
      
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
        <p className="text-sm text-blue-700">
          Teachers are created automatically when a user signs up. Ask your teachers to sign up on the portal, and their accounts will appear here.
        </p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {teachers?.map((t: any) => (
              <tr key={t.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t.profiles?.full_name || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.profiles?.email}</td>
              </tr>
            ))}
            {(!teachers || teachers.length === 0) && (
              <tr>
                <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">No teachers registered yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
