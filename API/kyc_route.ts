// app/api/kyc/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase_server';

// POST /api/kyc — upload KYC document record after Supabase Storage upload
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { booking_id, document_type, file_url } = await req.json();

  const { data, error } = await supabase
    .from('tbl_kyc')
    .upsert({
      user_id: user.id,
      booking_id,
      document_type,
      file_url,
      verification_status: 'pending',
    }, { onConflict: 'user_id,booking_id,document_type' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// GET /api/kyc?booking_id=xxx — get KYC docs for a booking
export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(req.url);
  const bookingId = searchParams.get('booking_id');
  if (!bookingId) return NextResponse.json({ error: 'booking_id required' }, { status: 400 });

  const { data, error } = await supabase
    .from('tbl_kyc')
    .select('*')
    .eq('booking_id', bookingId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}