// app/api/units/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase_server';

// GET /api/units/[id]
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tbl_units')
    .select('*, tbl_feedbacks(rating, comment, created_at, tbl_users(first_name))')
    .eq('unit_id', params.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

// PATCH /api/units/[id] — admin updates unit
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createAdminClient();
  const body = await req.json();

  const { data, error } = await supabase
    .from('tbl_units')
    .update(body)
    .eq('unit_id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/units/[id] — admin archives unit (soft delete)
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('tbl_units')
    .update({ status: 'maintenance' })
    .eq('unit_id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: 'Unit archived' });
}