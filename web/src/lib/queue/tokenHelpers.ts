import { createClient } from '@/lib/supabase/server';

export interface TokenRecord {
  id: string;
  appointment_id: string;
  doctor_id: string;
  token_number: string;
  priority: number;
  status: 'waiting' | 'in-progress' | 'done' | 'cancelled';
  created_at: string;
  started_at?: string | null;
}

/**
 * Generate a token number for a doctor on a given day.
 * Format: DOC001-YYYYMMDD-001 (doctor_code + date + sequence)
 */
export async function generateTokenNumber(supabase: any, doctorId: string): Promise<string> {
  const today = new Date();
  const dateStr = today.getFullYear().toString() + 
                  (today.getMonth() + 1).toString().padStart(2, '0') + 
                  today.getDate().toString().padStart(2, '0');
  
  const tokenPrefix = `${doctorId}-${dateStr}-`;
  
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

  // Get count of tokens created today for this doctor
  const { count, error } = await supabase
    .from('tokens')
    .select('*', { count: 'exact', head: true })
    .eq('doctor_id', doctorId)
    .gte('created_at', startOfDay)
    .lte('created_at', endOfDay);

  if (error) {
    throw new Error(`Error fetching token count: ${error.message}`);
  }

  const sequence = ((count || 0) + 1).toString().padStart(3, '0');
  return `${tokenPrefix}${sequence}`;
}

/**
 * Calculate the queue for a doctor with estimated wait times.
 * Formula: (patients_ahead_in_queue * avg_time) + current_patient_remaining_time
 */
export async function calculateQueueWithWaitTimes(supabase: any, doctorId: string, avgTimeMinutes: number = 10) {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  
  const { data: tokens, error } = await supabase
    .from('tokens')
    .select('*')
    .eq('doctor_id', doctorId)
    .gte('created_at', startOfDay)
    .in('status', ['waiting', 'in-progress'])
    .order('priority', { ascending: true }) // 1 (Emergency) is highest priority
    .order('created_at', { ascending: true }); // FIFO for same priority

  if (error) {
    throw new Error(`Error fetching queue: ${error.message}`);
  }

  let currentPatientRemainingTime = 0;
  const inProgressToken = tokens.find((t: any) => t.status === 'in-progress');
  
  if (inProgressToken) {
    if (inProgressToken.started_at) {
      const elapsedMs = new Date().getTime() - new Date(inProgressToken.started_at).getTime();
      const elapsedMinutes = elapsedMs / 60000;
      currentPatientRemainingTime = Math.max(0, avgTimeMinutes - elapsedMinutes);
    } else {
      currentPatientRemainingTime = avgTimeMinutes;
    }
  }

  let waitingPatientsSeen = 0;
  
  const queueWithWaitTimes = tokens.map((token: any) => {
    if (token.status === 'in-progress') {
      return { ...token, estimatedWaitTime: 0 };
    }
    
    // For waiting patients, sum the times
    const estimatedWaitTime = (waitingPatientsSeen * avgTimeMinutes) + currentPatientRemainingTime;
    waitingPatientsSeen++;
    
    return { ...token, estimatedWaitTime: Math.round(estimatedWaitTime) };
  });

  return queueWithWaitTimes;
}

/**
 * Maps a patient category to a queue priority level.
 */
export function getPriorityForPatientCategory(category: string): number {
  switch (category?.toLowerCase()) {
    case 'emergency':
      return 1;
    case 'pregnant':
      return 2;
    case 'senior':
      return 3;
    case 'regular':
    default:
      return 4;
  }
}
