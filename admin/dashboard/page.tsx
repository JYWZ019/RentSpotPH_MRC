// app/admin/dashboard/page.tsx
import { createClient } from '@/lib/supabase_server';
import AdminSidebar from '@/components/admin/AdminSidebar';
import MetricCard from '@/components/admin/MetricCard';
import RecentBookingsTable from '@/components/admin/RecentBookingsTable';
import RevenueChart from '@/components/admin/RevenueChart';
import { DollarSign, Users, Package, Clock } from 'lucide-react';

export default async function AdminDashboardPage() {
  const supabase = createClient();

  const [
    { count: totalUsers },
    { count: activeRentals },
    { count: pendingApprovals },
    { data: recentBookings },
    { data: paymentsData },
  ] = await Promise.all([
    supabase.from('tbl_users').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('tbl_bookings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('tbl_bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('tbl_bookings')
      .select('*, tbl_users(first_name, last_name), tbl_units(unit_name, category)')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase.from('tbl_payment').select('amount_paid').eq('payment_status', 'confirmed'),
  ]);

  const totalRevenue = (paymentsData ?? []).reduce((sum: number, p: any) => sum + Number(p.amount_paid), 0);

  const metrics = [
    { label: 'Total Revenue', value: `₱${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600 bg-green-50' },
    { label: 'Active Rentals', value: activeRentals ?? 0, icon: Package, color: 'text-blue-600 bg-blue-50' },
    { label: 'Total Users', value: totalUsers ?? 0, icon: Users, color: 'text-purple-600 bg-purple-50' },
    { label: 'Pending Approvals', value: pendingApprovals ?? 0, icon: Clock, color: 'text-orange-600 bg-orange-50' },
  ];

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <AdminSidebar active="dashboard" />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {metrics.map(m => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>

        {/* Charts & Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <RevenueChart />
        </div>

        <div className="card">
          <h2 className="text-base font-semibold mb-4">Recent Bookings</h2>
          <RecentBookingsTable bookings={recentBookings ?? []} />
        </div>
      </main>
    </div>
  );
}