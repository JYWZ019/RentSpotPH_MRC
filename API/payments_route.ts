// app/api/payments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase_server';

// POST /api/payments — record a payment
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { booking_id, amount_paid, payment_method, proof_of_payment_url } = await req.json();

  const { data, error } = await supabase
    .from('tbl_payment')
    .insert({
      booking_id,
      amount_paid,
      payment_method,
      proof_of_payment_url: proof_of_payment_url ?? null,
      payment_status: 'pending',
      paid_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// PATCH /api/payments — admin confirms/rejects payment
export async function PATCH(req: NextRequest) {
  const supabase = createClient();
  const { payment_id, payment_status } = await req.json();

  const { data, error } = await supabase
    .from('tbl_payment')
    .update({ payment_status })
    .eq('payment_id', payment_id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}