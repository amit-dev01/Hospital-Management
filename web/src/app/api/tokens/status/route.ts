import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { tokenId, status } = body;

    if (!tokenId || !status) {
      return NextResponse.json({ error: 'tokenId and status are required' }, { status: 400 });
    }

    const validStatuses = ['waiting', 'in-progress', 'done', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updateData: any = { status };

    // If status is changed to in-progress, record the started_at time for ETA calculations
    if (status === 'in-progress') {
      updateData.started_at = new Date().toISOString();
    }

    const { data: token, error } = await supabase
      .from('tokens')
      .update(updateData)
      .eq('id', tokenId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Token status updated successfully',
      token
    }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
