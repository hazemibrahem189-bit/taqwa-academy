import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function TeacherDashboard() {
  const supabase = await createClient();
  
  // Teachers table RLS policy allows them to read their own assigned students
  const { data: students, error } = await supabase
    .from("students")
    .select(`
      id,
      full_name,
      parent_email,
      classes!inner (id)
    `);

  if (error) {
    console.error("Error fetching students:", error);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">My Students</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {students?.length === 0 ? (
            <li className="px-6 py-4 text-gray-500">No students assigned yet.</li>
          ) : (
            students?.map((student) => (
              <li key={student.id}>
                <Link href={`/teacher/student/${student.id}`} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-green-700 truncate">{student.full_name}</p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {student.parent_email}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
