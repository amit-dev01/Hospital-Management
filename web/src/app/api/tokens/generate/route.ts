import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateTokenNumber, getPriorityForPatientCategory } from '@/lib/queue/tokenHelpers';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { appointmentId, doctorId, patientCategory } = body;

    if (!appointmentId || !doctorId) {
      return NextResponse.json({ error: 'appointmentId and doctorId are required' }, { status: 400 });
    }

    // Determine priority
    const priority = getPriorityForPatientCategory(patientCategory);

    // Generate token number
    const tokenNumber = await generateTokenNumber(supabase, doctorId);

    // Insert new token
    const { data: token, error } = await supabase
      .from('tokens')
      .insert([
        {
          appointment_id: appointmentId,
          doctor_id: doctorId,
          token_number: tokenNumber,
          priority: priority,
          status: 'waiting',
          // Note: created_at will be set automatically by DB or we can provide it explicitly
        }
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Token generated successfully',
      token
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
