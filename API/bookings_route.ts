// app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase_server';

// GET /api/bookings — get current user's bookings (or all for admin)
export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('tbl_users').select('role').eq('user_id', user.id).single();

  let query = supabase
    .from('tbl_bookings')
    .select('*, tbl_units(unit_name, category, image_url, daily_rate), tbl_users(first_name, last_name, email), tbl_payment(*), tbl_kyc(*)')
    .order('created_at', { ascending: false });

  if (profile?.role !== 'admin') {
    query = query.eq('user_id', user.id);
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/bookings — create a new booking
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { unit_id, start_date, end_date, total_amount } = await req.json();

  // Check for double booking
  const { data: conflicts } = await supabase
    .from('tbl_bookings')
    .select('booking_id')
    .eq('unit_id', unit_id)
    .not('status', 'in', '("cancelled","rejected")')
    .or(`start_date.lte.${end_date},end_date.gte.${start_date}`);

  if (conflicts && conflicts.length > 0) {
    return NextResponse.json({ error: 'Unit is not available for selected dates' }, { status: 409 });
  }

  const { data, error } = await supabase
    .from('tbl_bookings')
    .insert({ user_id: user.id, unit_id, start_date, end_date, total_amount, status: 'pending' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}