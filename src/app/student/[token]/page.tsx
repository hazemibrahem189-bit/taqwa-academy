import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Calendar, BookOpen, Star, FileText } from "lucide-react";

export default async function StudentPortal({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  // We use service_role client here, or RLS policy that allows lookup by token.
  // Actually, standard `createServerClient` uses the anon key by default.
  // Since students don't log in, they query the DB as anon. 
  // Let's create an RPC or just use the service role key to fetch this specific data.
  // Using an API route or fetching directly here with a dedicated server-only client is safer.
  
  import { createClient as createSupabaseClient } from '@supabase/supabase-js'

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // We need to add this to .env
  );

  const { data: student, error: studentError } = await supabaseAdmin
    .from("students")
    .select(`
      id,
      full_name,
      classes (
        id,
        teachers ( profiles ( full_name ) ),
        schedules ( day_of_week, time_utc ),
        sessions (
          id,
          session_date,
          surah,
          ayahs,
          memorization_score,
          tajweed_remarks,
          homework,
          status
        )
      )
    `)
    .eq("access_token", token)
    .single();

  if (studentError || !student) {
    notFound();
  }

  const studentClasses = student.classes as any[];
  const classData = studentClasses[0]; // Assuming 1 active class for now
  const sessions = classData?.sessions || [];
  const recentSession = sessions.sort((a: any, b: any) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime())[0];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-green-800 rounded-2xl p-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">Welcome, {student.full_name}</h1>
          <p className="text-green-100 flex items-center">
            <BookOpen className="mr-2" size={18} /> 
            Taqwa Academy Student Portal
          </p>
        </div>

        {/* Latest Session Evaluation */}
        {recentSession ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
              <Star className="mr-2 text-yellow-500" /> Latest Session Evaluation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Date</p>
                <p className="font-medium">{new Date(recentSession.session_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Memorization Score</p>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${recentSession.memorization_score}%` }}></div>
                  </div>
                  <span className="font-medium text-sm">{recentSession.memorization_score}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Surah / Ayahs</p>
                <p className="font-medium">{recentSession.surah} ({recentSession.ayahs})</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Homework</p>
                <p className="font-medium text-blue-700">{recentSession.homework || 'None'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500 mb-1">Tajweed Remarks</p>
                <div className="bg-gray-50 p-4 rounded-lg text-gray-700 text-sm">
                  {recentSession.tajweed_remarks || 'No remarks provided.'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
            No session evaluations yet.
          </div>
        )}

      </div>
    </div>
  );
}
