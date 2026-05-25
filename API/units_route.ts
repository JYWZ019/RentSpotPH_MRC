// app/api/units/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase_server';

// GET /api/units — list units (public, with optional filters)
export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const status = searchParams.get('status') ?? 'available';

  let query = supabase
    .from('tbl_units')
    .select('*, tbl_feedbacks(rating)')
    .order('created_at', { ascending: false });

  if (category) query = query.eq('category', category);
  if (status !== 'all') query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/units — admin creates a new unit
export async function POST(req: NextRequest) {
  const supabase = createAdminClient();
  const body = await req.json();
  const { unit_name, category, description, daily_rate, status, image_url } = body;

  const { data, error } = await supabase
    .from('tbl_units')
    .insert({ unit_name, category, description, daily_rate, status: status ?? 'available', image_url })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}