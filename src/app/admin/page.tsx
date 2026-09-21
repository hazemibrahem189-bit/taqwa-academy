import { createClient } from "@/utils/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();
  
  const { data: classes } = await supabase
    .from("classes")
    .select(`
      id,
      student_fee_per_session,
      teacher_payout_per_session,
      sessions (id, status)
    `);

  let totalRevenue = 0;
  let totalPayout = 0;

  classes?.forEach(c => {
    // Only count attended sessions for revenue
    const attendedSessions = c.sessions.filter(s => s.status === 'attended').length;
    totalRevenue += attendedSessions * Number(c.student_fee_per_session);
    totalPayout += attendedSessions * Number(c.teacher_payout_per_session);
  });

  const netProfit = totalRevenue - totalPayout;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Financial Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wider mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wider mb-2">Teacher Payouts</h3>
          <p className="text-3xl font-bold text-orange-600">${totalPayout.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wider mb-2">Net Profit</h3>
          <p className="text-3xl font-bold text-blue-600">${netProfit.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
