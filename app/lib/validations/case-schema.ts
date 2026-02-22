import { z } from 'zod'
import { CASE_TYPES, SPECIES_TYPES, URGENCY_LEVELS, CONTACT_METHODS } from '@/app/lib/constants'

export const caseFormSchema = z.object({
  case_type: z.enum([CASE_TYPES.RESCUE, CASE_TYPES.ABUSE, CASE_TYPES.LOST, CASE_TYPES.FOUND]),
  species: z.enum([SPECIES_TYPES.DOG, SPECIES_TYPES.CAT, SPECIES_TYPES.BIRD, SPECIES_TYPES.OTHER]),
  urgency: z.enum([URGENCY_LEVELS.LOW, URGENCY_LEVELS.MEDIUM, URGENCY_LEVELS.HIGH, URGENCY_LEVELS.CRITICAL]),
  title: z.string()
    .min(10, 'El título debe tener al menos 10 caracteres')
    .max(100, 'El título no puede exceder 100 caracteres'),
  description: z.string()
    .min(50, 'La descripción debe tener al menos 50 caracteres')
    .max(2000, 'La descripción no puede exceder 2000 caracteres'),
  exact_lat: z.number()
    .min(-90, 'Latitud inválida')
    .max(90, 'Latitud inválida'),
  exact_lng: z.number()
    .min(-180, 'Longitud inválida')
    .max(180, 'Longitud inválida'),
  address: z.string().optional(),
  contact_name: z.string().optional(),
  contact_phone: z.string()
    .regex(/^[0-9+\-\s()]+$/, 'Número de teléfono inválido')
    .optional(),
  contact_email: z.string()
    .email('Email inválido')
    .optional(),
  contact_method: z.enum([CONTACT_METHODS.PHONE, CONTACT_METHODS.EMAIL, CONTACT_METHODS.WHATSAPP])
    .optional(),
  is_anonymous: z.boolean().optional().default(false),
  consent_given: z.literal(true).refine(val => val === true, {
    message: 'Debes dar tu consentimiento para continuar',
  }),
})

export type CaseFormInput = z.infer<typeof caseFormSchema>

export const caseUpdateSchema = z.object({
  case_id: z.string().uuid(),
  note: z.string().min(10, 'La nota debe tener al menos 10 caracteres').optional(),
  new_status: z.enum(['new', 'under_review', 'in_progress', 'resolved', 'closed', 'spam']).optional(),
})

export const claimCaseSchema = z.object({
  case_id: z.string().uuid(),
  notes: z.string().optional(),
})
