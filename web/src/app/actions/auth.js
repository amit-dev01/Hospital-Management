'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// ── SIGN IN ──────────────────────────────────────────────────────────────────
export async function signIn(formData) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });

  if (error) {
    return { error: error.message };
  }

  // Fetch role from profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  revalidatePath('/', 'layout');

  const role = profile?.role || 'patient';
  if (role === 'doctor') redirect('/doctor/dashboard');
  if (role === 'admin') redirect('/hospital/dashboard');
  redirect('/patient/dashboard');
}

// ── SIGN UP — PATIENT ─────────────────────────────────────────────────────────
export async function signUpPatient(formData) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        full_name: formData.name,
        role: 'patient',
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: 'Failed to create user account.' };
  }

  // Insert profile (Using upsert to prevent duplicate key errors on retry)
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: data.user.id,
    role: 'patient',
    full_name: formData.name,
    phone: formData.phone,
    updated_at: new Date().toISOString(),
  });

  if (profileError) {
    return { error: profileError.message };
  }

  // Insert patient-specific data
  const { error: patientError } = await supabase.from('patients').upsert({
    id: data.user.id,
    age: parseInt(formData.age),
    gender: formData.gender,
    blood_group: formData.bloodGroup,
  });

  if (patientError) {
    return { error: patientError.message };
  }

  revalidatePath('/', 'layout');
  
  return { 
    success: true, 
    emailVerificationRequired: !data.session,
    redirectTo: '/login?role=patient&registered=true'
  };
}

// ── SIGN UP — DOCTOR ──────────────────────────────────────────────────────────
export async function signUpDoctor(formData) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        full_name: formData.name,
        role: 'doctor',
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: 'Failed to create user account.' };
  }

  // Insert profile (Using upsert to prevent duplicate key errors on retry)
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: data.user.id,
    role: 'doctor',
    full_name: formData.name,
    phone: formData.phone,
    updated_at: new Date().toISOString(),
  });

  if (profileError) {
    return { error: profileError.message };
  }

  // Insert doctor-specific data
  const { error: doctorError } = await supabase.from('doctors').upsert({
    id: data.user.id,
    specialization: formData.specialization,
    experience_years: parseInt(formData.experience),
    hospital_name: formData.hospitalName,
    license_number: formData.licenseNumber,
    is_verified: false,
  });

  if (doctorError) {
    return { error: doctorError.message };
  }

  revalidatePath('/', 'layout');
  
  return { 
    success: true, 
    emailVerificationRequired: !data.session,
    redirectTo: '/login?role=doctor&registered=true'
  };
}

// ── SIGN UP — ADMIN ───────────────────────────────────────────────────────────
export async function signUpAdmin(formData) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        full_name: formData.name,
        role: 'admin',
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: 'Failed to create user account.' };
  }

  // Insert profile (Using upsert to prevent duplicate key errors on retry)
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: data.user.id,
    role: 'admin',
    full_name: formData.name,
    phone: formData.phone,
    updated_at: new Date().toISOString(),
  });

  if (profileError) {
    return { error: profileError.message };
  }

  // Insert admin-specific data (Assuming an 'admins' table exists following the project pattern)
  const { error: adminError } = await supabase.from('admins').upsert({
    id: data.user.id,
    department: formData.department,
    employee_id: formData.employeeId,
  });

  if (adminError) {
    console.error('Error inserting into admins table:', adminError);
  }

  revalidatePath('/', 'layout');
  
  return { 
    success: true, 
    emailVerificationRequired: !data.session,
    redirectTo: '/login?role=admin&registered=true'
  };
}

// ── SIGN OUT ──────────────────────────────────────────────────────────────────
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

// ── GET USER PROFILE ──────────────────────────────────────────────────────────
export async function getUserProfile() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  // Fetch role-specific data
  let roleData = null;
  if (profile.role === 'patient') {
    const { data: patient } = await supabase.from('patients').select('*').eq('id', user.id).single();
    roleData = patient;
  } else if (profile.role === 'doctor') {
    const { data: doctor } = await supabase.from('doctors').select('*').eq('id', user.id).single();
    roleData = doctor;
  }

  return {
    user,
    profile,
    roleData
  };
}

// ── ADMIN ACTIONS ────────────────────────────────────────────────────────────
export async function getUnverifiedDoctors() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('doctors')
    .select(`
      *,
      profiles (
        full_name,
        phone
      )
    `)
    .eq('is_verified', false);

  if (error) {
    console.error('Error fetching unverified doctors:', error);
    return [];
  }

  return data;
}

export async function verifyDoctor(doctorId) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('doctors')
    .update({ is_verified: true })
    .eq('id', doctorId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/hospital/dashboard');
  return { success: true };
}
