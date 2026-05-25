// app/api/kyc/[id]/route.ts — admin verify/reject a KYC document
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase_server';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createAdminClient();
  const { verification_status } = await req.json();

  if (!['approved', 'rejected'].includes(verification_status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('tbl_kyc')
    .update({ verification_status, reviewed_at: new Date().toISOString() })
    .eq('document_id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}