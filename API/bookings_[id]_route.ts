// app/api/bookings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase_server';
import { sendBookingStatusEmail } from '@/lib/email';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tbl_bookings')
    .select('*, tbl_units(*), tbl_users(*), tbl_payment(*), tbl_kyc(*)')
    .eq('booking_id', params.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createAdminClient();
  const { status, notes } = await req.json();

  const { data, error } = await supabase
    .from('tbl_bookings')
    .update({ status })
    .eq('booking_id', params.id)
    .select('*, tbl_users(email, first_name)')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send notification email
  if (data?.tbl_users?.email) {
    await sendBookingStatusEmail({
      to: data.tbl_users.email,
      firstName: data.tbl_users.first_name,
      bookingId: params.id,
      status,
      notes,
    }).catch(console.error); // non-blocking
  }

  // Log notification in DB
  await supabase.from('tbl_notifications').insert({
    user_id: data.user_id,
    booking_id: params.id,
    subject: `Booking ${status.replace('_', ' ')}`,
    message: notes ?? `Your booking has been updated to: ${status}`,
    type: 'booking_confirmation',
    is_read: false,
  });

  return NextResponse.json(data);
}