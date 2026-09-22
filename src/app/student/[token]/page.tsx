import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { notFound } from "next/navigation";
import { BookOpen, Star, Calendar } from "lucide-react";

export default async function StudentPortal({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: student, error } = await supabaseAdmin
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

  if (error || !student) {
    notFound();
  }

  const classData = (student.classes as any[])?.[0];
  const sessions = (classData?.sessions || []).sort(
    (a: any, b: any) =>
      new Date(b.session_date).getTime() - new Date(a.session_date).getTime()
  );
  const recentSession = sessions[0];
  const teacherName = (classData?.teachers as any)?.profiles?.full_name;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">

        <div className="bg-green-800 rounded-2xl p-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-1">Welcome, {student.full_name}</h1>
          {teacherName && (
            <p className="text-green-200 text-sm">Teacher: {teacherName}</p>
          )}
          <p className="text-green-100 flex items-center mt-2">
            <BookOpen className="mr-2" size={18} />
            Taqwa Academy Student Portal
          </p>
        </div>

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
                    <div
                      className="bg-green-600 h-2.5 rounded-full"
                      style={{ width: `${recentSession.memorization_score}%` }}
                    ></div>
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
                <p className="font-medium text-blue-700">{recentSession.homework || 'None assigned'}</p>
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

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <Calendar className="mr-2 text-blue-500" /> Past Sessions ({sessions.length} total)
          </h2>
          <div className="space-y-3">
            {sessions.slice(0, 5).map((s: any) => (
              <div key={s.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{new Date(s.session_date).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500">Surah {s.surah}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  s.status === 'attended' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
