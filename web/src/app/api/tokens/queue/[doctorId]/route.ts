import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateQueueWithWaitTimes } from '@/lib/queue/tokenHelpers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ doctorId: string }> }
) {
  try {
    const supabase = await createClient();
    const resolvedParams = await params;
    const doctorId = resolvedParams.doctorId;
    
    // You could potentially pass average time in the request URL params
    const { searchParams } = new URL(request.url);
    const avgTimeStr = searchParams.get('avgTime');
    const avgTime = avgTimeStr ? parseInt(avgTimeStr, 10) : 10;

    const queue = await calculateQueueWithWaitTimes(supabase, doctorId, avgTime);

    return NextResponse.json({
      doctorId,
      queue
    }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
