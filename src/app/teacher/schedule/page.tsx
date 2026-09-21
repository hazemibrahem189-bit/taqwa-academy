import { createClient } from "@/utils/supabase/server";
import { Calendar as CalendarIcon, Clock, User } from "lucide-react";

export default async function TeacherSchedule() {
  const supabase = await createClient();

  // Fetch schedules for classes assigned to this teacher
  const { data: schedules } = await supabase
    .from("schedules")
    .select(`
      id,
      day_of_week,
      time_utc,
      classes!inner (
        students ( full_name, parent_email )
      )
    `)
    .order('day_of_week')
    .order('time_utc');

  const daysOfWeek = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];

  // Group by day of week
  const groupedSchedules = daysOfWeek.map((day, index) => ({
    day,
    classes: schedules?.filter(s => s.day_of_week === index) || []
  }));

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center">
        <CalendarIcon className="mr-3" size={28} /> My Weekly Schedule
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {groupedSchedules.map((scheduleGroup, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-green-800 text-white px-4 py-3 font-semibold text-lg">
              {scheduleGroup.day}
            </div>
            <div className="p-4">
              {scheduleGroup.classes.length === 0 ? (
                <p className="text-gray-400 text-sm italic">No classes scheduled.</p>
              ) : (
                <div className="space-y-4">
                  {scheduleGroup.classes.map((cls: any) => (
                    <div key={cls.id} className="flex items-start bg-gray-50 p-3 rounded-md border border-gray-100">
                      <div className="flex-shrink-0 bg-green-100 p-2 rounded-full mr-3 text-green-700">
                        <Clock size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{cls.time_utc.substring(0, 5)} UTC</p>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <User size={14} className="mr-1" /> {cls.classes.students.full_name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
