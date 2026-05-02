import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateQueueWithWaitTimes } from '@/lib/queue/tokenHelpers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const supabase = await createClient();
    const resolvedParams = await params;
    const appointmentId = resolvedParams.appointmentId;

    if (!appointmentId) {
      return NextResponse.json({ error: 'appointmentId is required' }, { status: 400 });
    }

    // Fetch this patient's token
    const { data: token, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('appointment_id', appointmentId)
      .single();

    if (error || !token) {
      return NextResponse.json({ error: 'Token not found for this appointment' }, { status: 404 });
    }

    // Get optional avgTime from query params
    const { searchParams } = new URL(request.url);
    const avgTimeStr = searchParams.get('avgTime');
    const avgTime = avgTimeStr ? parseInt(avgTimeStr, 10) : 10;

    // Fetch full queue for the doctor to calculate position and wait time
    const queue = await calculateQueueWithWaitTimes(supabase, token.doctor_id, avgTime);

    // Find this patient's entry in the queue
    const myEntry = queue.find((t: any) => t.appointment_id === appointmentId);

    // Position in queue = index + 1 (only among waiting/in-progress)
    const position = queue.findIndex((t: any) => t.appointment_id === appointmentId) + 1;

    return NextResponse.json({
      token,
      queuePosition: position,
      estimatedWaitTime: myEntry?.estimatedWaitTime ?? null,
      totalAhead: position > 0 ? position - 1 : 0,
    }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
