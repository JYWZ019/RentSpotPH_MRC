// app/api/reports/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase_server';

export async function GET(req: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') ?? 'dashboard';

  if (type === 'dashboard') {
    const [
      { count: totalUsers },
      { count: activeRentals },
      { count: pendingApprovals },
      { count: totalBookings },
      { data: payments },
    ] = await Promise.all([
      supabase.from('tbl_users').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
      supabase.from('tbl_bookings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('tbl_bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('tbl_bookings').select('*', { count: 'exact', head: true }),
      supabase.from('tbl_payment').select('amount_paid').eq('payment_status', 'confirmed'),
    ]);

    const totalRevenue = (payments ?? []).reduce((sum: number, p: any) => sum + Number(p.amount_paid), 0);
    const avgBookingValue = totalBookings ? totalRevenue / totalBookings : 0;

    return NextResponse.json({
      total_revenue: totalRevenue,
      active_rentals: activeRentals ?? 0,
      total_users: totalUsers ?? 0,
      pending_approvals: pendingApprovals ?? 0,
      total_bookings: totalBookings ?? 0,
      avg_booking_value: avgBookingValue,
    });
  }

  if (type === 'top_units') {
    const { data, error } = await supabase
      .from('tbl_bookings')
      .select('unit_id, total_amount, tbl_units(unit_name, category)')
      .not('status', 'in', '("cancelled","rejected")')
      .limit(100);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Aggregate by unit
    const map: Record<string, any> = {};
    for (const b of data ?? []) {
      if (!b.unit_id) continue;
      if (!map[b.unit_id]) {
        map[b.unit_id] = {
          unit_id: b.unit_id,
          unit_name: (b as any).tbl_units?.unit_name,
          category: (b as any).tbl_units?.category,
          total_bookings: 0,
          total_revenue: 0,
        };
      }
      map[b.unit_id].total_bookings += 1;
      map[b.unit_id].total_revenue += Number(b.total_amount);
    }

    return NextResponse.json(Object.values(map).sort((a, b) => b.total_revenue - a.total_revenue));
  }

  return NextResponse.json({ error: 'Unknown report type' }, { status: 400 });
}