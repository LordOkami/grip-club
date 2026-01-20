// Database types for Firestore
import type { Timestamp } from 'firebase-admin/firestore';

export type EngineCapacity = '125cc_4t' | '50cc_2t';
export type MotorcycleExperience =
  | 'principiante'
  | 'rutero'
  | 'tandero_iniciado'
  | 'tandero_medio'
  | 'tandero_rapido'
  | 'semi_pro';

export type TShirtSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';
export type RegistrationStatus = 'draft' | 'pending' | 'confirmed' | 'cancelled';
export type PhotoStatus = 'pending' | 'approved' | 'rejected';
export type StaffRole = 'mechanic' | 'coordinator' | 'support';

// Firestore document types (camelCase)
export interface Team {
  id: string;
  representativeUserId: string;
  name: string;
  preferredNumber?: number;
  numberOfPilots: number;

  // Representative info
  representativeName: string;
  representativeSurname: string;
  representativeDni: string;
  representativePhone: string;
  representativeEmail: string;

  // Address
  address?: string;
  municipality?: string;
  postalCode?: string;
  province?: string;

  // Motorcycle
  motorcycleBrand?: string;
  motorcycleModel?: string;
  motorcyclePhoto?: string;
  motorcyclePhotoStatus?: PhotoStatus;
  engineCapacity: EngineCapacity;
  registrationDate?: string;
  modifications?: string;

  // Meta
  comments?: string;
  gdprConsent: boolean;
  gdprConsentDate?: string;
  status: RegistrationStatus;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

export interface Pilot {
  id: string;
  teamId: string;
  isCaptain: boolean;
  name: string;
  surname: string;
  dni: string;
  phone: string;
  email: string;
  birthDate: string;

  // Address (for accreditation shipping)
  address: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;

  // Experience & preferences
  motorcycleExperience: MotorcycleExperience;
  tShirtSize: TShirtSize;
  allergies: string;

  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

export interface TeamStaff {
  id: string;
  teamId: string;
  name: string;
  dni?: string;
  phone?: string;
  role: StaffRole;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

export interface RegistrationSettings {
  id: string;
  registrationOpen: boolean;
  registrationDeadline?: string;
  pilotModificationDeadline?: string;
  maxTeams: number;
  updatedAt: Timestamp | string;
}

export interface TeamWithRelations extends Team {
  pilots: Pilot[];
  staff: TeamStaff[];
}

// Form input types (for user-submitted data)
export interface TeamFormData {
  name: string;
  preferredNumber?: number;
  numberOfPilots: number;
  representativeName: string;
  representativeSurname: string;
  representativeDni: string;
  representativePhone: string;
  representativeEmail: string;
  address?: string;
  municipality?: string;
  postalCode?: string;
  province?: string;
  motorcycleBrand?: string;
  motorcycleModel?: string;
  motorcyclePhoto?: string;
  engineCapacity: EngineCapacity;
  registrationDate?: string;
  modifications?: string;
  comments?: string;
  gdprConsent: boolean;
}

export interface PilotFormData {
  isCaptain: boolean;
  name: string;
  surname: string;
  dni: string;
  phone: string;
  email: string;
  birthDate: string;
  address: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  motorcycleExperience: MotorcycleExperience;
  tShirtSize: TShirtSize;
  allergies: string;
}

export interface StaffFormData {
  name: string;
  dni?: string;
  phone?: string;
  role: StaffRole;
}

// Helper to convert Timestamp to ISO string
export function timestampToString(timestamp: Timestamp | string | undefined): string {
  if (!timestamp) return '';
  if (typeof timestamp === 'string') return timestamp;
  return timestamp.toDate().toISOString();
}
