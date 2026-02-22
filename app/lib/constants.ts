export const CASE_TYPES = {
  RESCUE: 'rescue',
  ABUSE: 'abuse',
  LOST: 'lost',
  FOUND: 'found',
} as const

export const CASE_STATUS = {
  NEW: 'new',
  UNDER_REVIEW: 'under_review',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  SPAM: 'spam',
} as const

export const URGENCY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const

export const SPECIES_TYPES = {
  DOG: 'dog',
  CAT: 'cat',
  BIRD: 'bird',
  OTHER: 'other',
} as const

export const USER_ROLES = {
  PUBLIC: 'public',
  REGISTERED: 'registered',
  RESCUER: 'rescuer',
  ADMIN: 'admin',
} as const

export const CONTACT_METHODS = {
  PHONE: 'phone',
  EMAIL: 'email',
  WHATSAPP: 'whatsapp',
} as const

export const MAX_PHOTO_SIZE = 5 * 1024 * 1024 // 5MB
export const MAX_PHOTOS_PER_CASE = 5
export const LOCATION_APPROXIMATION_RADIUS = 400 // meters

export const CASE_TYPE_LABELS = {
  [CASE_TYPES.RESCUE]: 'Rescate',
  [CASE_TYPES.ABUSE]: 'Denuncia de Maltrato',
  [CASE_TYPES.LOST]: 'Animal Perdido',
  [CASE_TYPES.FOUND]: 'Animal Encontrado',
} as const

export const STATUS_LABELS = {
  [CASE_STATUS.NEW]: 'Nuevo',
  [CASE_STATUS.UNDER_REVIEW]: 'En Revisión',
  [CASE_STATUS.IN_PROGRESS]: 'En Proceso',
  [CASE_STATUS.RESOLVED]: 'Resuelto',
  [CASE_STATUS.CLOSED]: 'Cerrado',
  [CASE_STATUS.SPAM]: 'Spam',
} as const

export const URGENCY_LABELS = {
  [URGENCY_LEVELS.LOW]: 'Baja',
  [URGENCY_LEVELS.MEDIUM]: 'Media',
  [URGENCY_LEVELS.HIGH]: 'Alta',
  [URGENCY_LEVELS.CRITICAL]: 'Crítica',
} as const

export const SPECIES_LABELS = {
  [SPECIES_TYPES.DOG]: 'Perro',
  [SPECIES_TYPES.CAT]: 'Gato',
  [SPECIES_TYPES.BIRD]: 'Ave',
  [SPECIES_TYPES.OTHER]: 'Otro',
} as const

// TypeScript types derived from constants
export type CaseStatus = typeof CASE_STATUS[keyof typeof CASE_STATUS]
export type CaseType = typeof CASE_TYPES[keyof typeof CASE_TYPES]
export type UrgencyLevel = typeof URGENCY_LEVELS[keyof typeof URGENCY_LEVELS]
export type SpeciesType = typeof SPECIES_TYPES[keyof typeof SPECIES_TYPES]
