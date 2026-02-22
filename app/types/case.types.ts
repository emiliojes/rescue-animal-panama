import { CASE_TYPES, CASE_STATUS, URGENCY_LEVELS, SPECIES_TYPES, CONTACT_METHODS } from '@/app/lib/constants'

export type CaseType = typeof CASE_TYPES[keyof typeof CASE_TYPES]
export type CaseStatus = typeof CASE_STATUS[keyof typeof CASE_STATUS]
export type UrgencyLevel = typeof URGENCY_LEVELS[keyof typeof URGENCY_LEVELS]
export type SpeciesType = typeof SPECIES_TYPES[keyof typeof SPECIES_TYPES]
export type ContactMethod = typeof CONTACT_METHODS[keyof typeof CONTACT_METHODS]

export interface Case {
  id: string
  created_by: string | null
  case_type: CaseType
  species: SpeciesType
  urgency: UrgencyLevel
  title: string
  description: string
  status: CaseStatus
  
  public_lat: number | null
  public_lng: number | null
  
  exact_lat: number | null
  exact_lng: number | null
  address: string | null
  
  contact_name: string | null
  contact_phone: string | null
  contact_email: string | null
  contact_method: ContactMethod | null
  
  consent_given: boolean
  is_anonymous: boolean
  flagged: boolean
  flag_count: number
  view_count: number
  
  created_at: string
  updated_at: string
  resolved_at: string | null
}

export interface CasePhoto {
  id: string
  case_id: string
  storage_path: string
  storage_url: string
  flagged: boolean
  is_sensitive: boolean
  display_order: number
  created_at: string
}

export interface CaseUpdate {
  id: string
  case_id: string
  user_id: string | null
  old_status: CaseStatus | null
  new_status: CaseStatus | null
  note: string | null
  is_public: boolean
  created_at: string
}

export interface CaseClaim {
  id: string
  case_id: string
  rescuer_id: string
  claimed_at: string
  released_at: string | null
  active: boolean
  notes: string | null
}

export interface Comment {
  id: string
  case_id: string
  user_id: string | null
  content: string
  flagged: boolean
  created_at: string
  updated_at: string
}

export interface Flag {
  id: string
  case_id: string | null
  comment_id: string | null
  photo_id: string | null
  user_id: string | null
  reason: string
  resolved: boolean
  created_at: string
}

export interface CaseFormData {
  case_type: CaseType
  species: SpeciesType
  urgency: UrgencyLevel
  title: string
  description: string
  exact_lat: number
  exact_lng: number
  address?: string
  contact_name?: string
  contact_phone?: string
  contact_email?: string
  contact_method?: ContactMethod
  is_anonymous: boolean
  consent_given: boolean
  photos?: File[]
}

export interface CaseFilters {
  case_type?: CaseType
  species?: SpeciesType
  urgency?: UrgencyLevel
  status?: CaseStatus
  search?: string
  lat?: number
  lng?: number
  radius?: number
  sortBy?: 'created_at' | 'urgency' | 'distance'
  sortOrder?: 'asc' | 'desc'
}
