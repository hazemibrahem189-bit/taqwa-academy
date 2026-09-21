import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { submitSessionReport } from "@/app/actions/teacher";
import { BookOpen, Calendar, CheckCircle, FileText, Star } from "lucide-react";

export default async function StudentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch student details and the specific class assigned to this teacher
  const { data: student, error } = await supabase
    .from("students")
    .select(`
      id,
      full_name,
      parent_email,
      classes!inner (
        id,
        sessions (
          id,
          session_date,
          status,
          surah,
          memorization_score
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error || !student) {
    notFound();
  }

  const classId = student.classes[0].id;
  const sessions = student.classes[0].sessions.sort(
    (a: any, b: any) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime()
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">{student.full_name}</h1>
        <p className="text-gray-500">{student.parent_email}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Session Submission Form */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <FileText className="mr-2" size={20} /> Submit Session Report
          </h2>
          
          <form action={submitSessionReport} className="space-y-4">
            <input type="hidden" name="class_id" value={classId} />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" name="session_date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select name="status" className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="attended">Attended</option>
                  <option value="missed">Missed</option>
                  <option value="canceled">Canceled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Surah</label>
                <input type="text" name="surah" placeholder="e.g. Al-Baqarah" required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ayahs</label>
                <input type="text" name="ayahs" placeholder="e.g. 1-15" required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Memorization Score (0-100)</label>
              <input type="number" name="memorization_score" min="0" max="100" defaultValue="90" required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tajweed Remarks</label>
              <textarea name="tajweed_remarks" rows={3} placeholder="Notes on pronunciation and rules..." className="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Homework for next time</label>
              <input type="text" name="homework" placeholder="e.g. Memorize Ayahs 16-25" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>

            <button type="submit" className="w-full bg-green-700 text-white py-2 px-4 rounded-md hover:bg-green-800 transition-colors flex justify-center items-center">
              <CheckCircle size={18} className="mr-2" /> Submit Report
            </button>
          </form>
        </div>

        {/* Past Sessions */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <Calendar className="mr-2" size={20} /> Past Sessions
          </h2>
          <div className="space-y-4">
            {sessions.length === 0 ? (
              <p className="text-gray-500 text-sm">No past sessions recorded.</p>
            ) : (
              sessions.map((session: any) => (
                <div key={session.id} className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{new Date(session.session_date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-500">Surah {session.surah}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      session.status === 'attended' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {session.status}
                    </span>
                    {session.status === 'attended' && (
                      <p className="text-sm font-medium text-yellow-600 mt-1 flex items-center justify-end">
                        <Star size={14} className="mr-1" /> {session.memorization_score}%
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
