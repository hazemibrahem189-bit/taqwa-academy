import { createClient } from "@/utils/supabase/server";
import { Activity, Star } from "lucide-react";

export default async function AdminSessions() {
  const supabase = await createClient();

  // Fetch recent sessions across the academy
  const { data: sessions } = await supabase
    .from("sessions")
    .select(`
      id,
      session_date,
      status,
      surah,
      memorization_score,
      created_at,
      classes (
        students ( full_name ),
        teachers ( profiles ( full_name ) )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center">
        <Activity className="mr-3 text-blue-600" size={28} /> Activity Log
      </h1>
      
      <p className="text-gray-500">Showing the 50 most recent session reports submitted by teachers.</p>

      <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-100">
        <ul role="list" className="divide-y divide-gray-200">
          {sessions?.map((session: any) => (
            <li key={session.id}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <p className="text-sm font-semibold text-blue-700 truncate">
                      {session.classes.students.full_name}
                    </p>
                    <span className="mx-2 text-gray-300">|</span>
                    <p className="text-sm text-gray-600 truncate">
                      Teacher: {session.classes.teachers.profiles.full_name}
                    </p>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex items-center">
                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full mr-3 ${
                      session.status === 'attended' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {session.status}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(session.session_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      Surah: {session.surah || 'N/A'}
                    </p>
                  </div>
                  {session.status === 'attended' && session.memorization_score != null && (
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <Star className="flex-shrink-0 mr-1.5 h-4 w-4 text-yellow-400" />
                      <p>
                        Score: <span className="font-medium text-gray-900">{session.memorization_score}%</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
          {(!sessions || sessions.length === 0) && (
            <li className="px-4 py-8 text-center text-gray-500">
              No session activity recorded yet.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
