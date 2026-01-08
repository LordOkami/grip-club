// Database types for Supabase

export type EngineCapacity = '125cc_4t' | '50cc_2t';
export type DrivingLevel = 'amateur' | 'intermediate' | 'advanced' | 'expert';
export type RegistrationStatus = 'draft' | 'pending' | 'confirmed' | 'cancelled';
export type StaffRole = 'mechanic' | 'coordinator' | 'support';

export interface Team {
  id: string;
  representative_user_id: string;
  name: string;
  number_of_pilots: number;

  // Representative info
  representative_name: string;
  representative_surname: string;
  representative_dni: string;
  representative_phone: string;
  representative_email: string;

  // Address
  address?: string;
  municipality?: string;
  postal_code?: string;
  province?: string;

  // Motorcycle
  motorcycle_brand?: string;
  motorcycle_model?: string;
  engine_capacity: EngineCapacity;
  registration_date?: string;
  modifications?: string;

  // Meta
  comments?: string;
  gdpr_consent: boolean;
  gdpr_consent_date?: string;
  status: RegistrationStatus;
  created_at: string;
  updated_at: string;
}

export interface Pilot {
  id: string;
  team_id: string;
  name: string;
  surname: string;
  dni: string;
  email: string;
  phone: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  driving_level: DrivingLevel;
  track_experience?: string;
  is_representative: boolean;
  pilot_number?: number;
  created_at: string;
  updated_at: string;
}

export interface TeamStaff {
  id: string;
  team_id: string;
  name: string;
  dni?: string;
  phone?: string;
  role: StaffRole;
  created_at: string;
  updated_at: string;
}

export interface RegistrationSettings {
  id: number;
  registration_open: boolean;
  registration_deadline?: string;
  pilot_modification_deadline?: string;
  max_teams: number;
  updated_at: string;
}

export interface TeamWithRelations extends Team {
  pilots: Pilot[];
  team_staff: TeamStaff[];
}

// Form input types
export interface TeamFormData {
  name: string;
  number_of_pilots: number;
  representative_name: string;
  representative_surname: string;
  representative_dni: string;
  representative_phone: string;
  representative_email: string;
  address?: string;
  municipality?: string;
  postal_code?: string;
  province?: string;
  motorcycle_brand?: string;
  motorcycle_model?: string;
  engine_capacity: EngineCapacity;
  registration_date?: string;
  modifications?: string;
  comments?: string;
  gdpr_consent: boolean;
}

export interface PilotFormData {
  name: string;
  surname: string;
  dni: string;
  email: string;
  phone: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  driving_level: DrivingLevel;
  track_experience?: string;
}

export interface StaffFormData {
  name: string;
  dni?: string;
  phone?: string;
  role: StaffRole;
}
