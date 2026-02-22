'use server'

import { createClient } from '@/app/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { approximateLocation } from '@/app/lib/utils/location'

interface CreateCaseData {
  case_type: string
  species: string
  urgency: string
  title: string
  description: string
  exact_lat: number
  exact_lng: number
  address?: string
  contact_name?: string
  contact_phone?: string
  contact_email?: string
  contact_method?: string
  is_anonymous: boolean
  consent_given: boolean
}

export async function createCase(data: CreateCaseData) {
  const supabase = await createClient()

  // Get current user (optional - can be null for anonymous reports)
  const { data: { user } } = await supabase.auth.getUser()

  // Rate limiting - max 5 cases per hour per user
  if (user) {
    const { checkRateLimit, CASE_RATE_LIMIT } = await import('@/app/lib/utils/rate-limit')
    const rateCheck = await checkRateLimit(user.id, CASE_RATE_LIMIT)
    if (!rateCheck.allowed) {
      return { error: rateCheck.error }
    }
  }

  // Approximate location for public display
  const approxLocation = approximateLocation(data.exact_lat, data.exact_lng, 400)

  // Prepare case data
  const caseData = {
    created_by: data.is_anonymous ? null : user?.id || null,
    case_type: data.case_type,
    species: data.species,
    urgency: data.urgency,
    title: data.title,
    description: data.description,
    status: 'new',
    
    // Public location (approximated)
    public_lat: approxLocation.lat,
    public_lng: approxLocation.lng,
    
    // Exact location (only for rescuers)
    exact_lat: data.exact_lat,
    exact_lng: data.exact_lng,
    address: data.address || null,
    
    // Contact info (only for rescuers)
    contact_name: data.contact_name || null,
    contact_phone: data.contact_phone || null,
    contact_email: data.contact_email || null,
    contact_method: data.contact_method || null,
    
    // Metadata
    consent_given: data.consent_given,
    is_anonymous: data.is_anonymous,
  }

  // Insert case
  const { data: newCase, error: insertError } = await supabase
    .from('cases')
    .insert(caseData)
    .select()
    .single()

  if (insertError) {
    console.error('Error creating case:', insertError)
    return { error: insertError.message }
  }

  // Notify rescuers if urgent case
  if (data.urgency === 'high' || data.urgency === 'critical') {
    const { notifyRescuersOnUrgentCase } = await import('@/app/lib/utils/urgency-alerts')
    await notifyRescuersOnUrgentCase(newCase.id, data.title, data.urgency)
  }

  revalidatePath('/casos')
  
  return { success: true, case: newCase }
}

export async function uploadCasePhoto(caseId: string, file: File) {
  const supabase = await createClient()

  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${caseId}/${Date.now()}.${fileExt}`

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('case-photos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    console.error('Error uploading photo:', uploadError)
    return { error: uploadError.message }
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('case-photos')
    .getPublicUrl(fileName)

  // Save photo record in database
  const { data: photoRecord, error: photoError } = await supabase
    .from('case_photos')
    .insert({
      case_id: caseId,
      storage_path: fileName,
      storage_url: publicUrl,
      flagged: false,
      is_sensitive: false,
    })
    .select()
    .single()

  if (photoError) {
    console.error('Error saving photo record:', photoError)
    return { error: photoError.message }
  }

  return { success: true, photo: photoRecord }
}

export async function getCases(filters?: {
  case_type?: string
  species?: string
  urgency?: string
  status?: string
  limit?: number
  showArchived?: boolean
}) {
  const supabase = await createClient()

  let query = supabase
    .from('cases')
    .select('*, case_photos(storage_url)')
    .order('created_at', { ascending: false })

  // By default, exclude archived cases
  if (!filters?.showArchived) {
    query = query.is('archived_at', null)
  }

  if (filters?.case_type) {
    query = query.eq('case_type', filters.case_type)
  }
  if (filters?.species) {
    query = query.eq('species', filters.species)
  }
  if (filters?.urgency) {
    query = query.eq('urgency', filters.urgency)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching cases:', error)
    return { error: error.message }
  }

  return { success: true, cases: data }
}

export async function getCaseById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('cases')
    .select('*, case_photos(storage_url)')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching case:', error)
    return { error: error.message }
  }

  // Control de acceso para datos sensibles
  const { getCurrentUserContext, canViewSensitiveData } = await import('@/app/lib/auth/permissions')
  const context = await getCurrentUserContext()

  // Si no hay contexto o no tiene permisos, ocultar datos sensibles
  if (!context || !canViewSensitiveData(context, data)) {
    // Remover datos sensibles
    const sanitizedData = {
      ...data,
      exact_lat: null,
      exact_lng: null,
      contact_phone: null,
      contact_email: null,
      contact_whatsapp: null,
    }
    return { success: true, case: sanitizedData }
  }

  return { success: true, case: data }
}

export async function updateCaseStatus(caseId: string, newStatus: string) {
  const supabase = await createClient()

  console.log('updateCaseStatus called with:', { caseId, newStatus })

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'Debes iniciar sesión para actualizar el estado' }
  }

  // Get current case data
  const { data: currentCase, error: fetchError } = await supabase
    .from('cases')
    .select('status, created_by, claimed_by')
    .eq('id', caseId)
    .single()

  console.log('Case fetch result:', { currentCase, fetchError })

  if (fetchError || !currentCase) {
    console.error('Case not found:', { caseId, fetchError })
    return { error: `Caso no encontrado: ${fetchError?.message || 'No data'}` }
  }

  // Check permissions
  const { getCurrentUserContext, canEditCase } = await import('@/app/lib/auth/permissions')
  const context = await getCurrentUserContext()

  if (!context) {
    return { error: 'No autorizado' }
  }

  // Only case owner, assigned rescuer, or admin can update status
  const canUpdate = 
    context.role === 'admin' ||
    context.userId === currentCase.created_by ||
    (currentCase.claimed_by && context.userId === currentCase.claimed_by)

  if (!canUpdate) {
    return { error: 'No tienes permiso para actualizar este caso' }
  }

  // Validate status transition
  const { validateStatusTransition, getStatusTransitionMessage } = await import('@/app/lib/validations/case-lifecycle')
  const validation = validateStatusTransition(currentCase.status, newStatus as any)

  if (!validation.valid) {
    return { error: validation.error }
  }

  // Update status
  const { error: updateError } = await supabase
    .from('cases')
    .update({ 
      status: newStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', caseId)

  if (updateError) {
    console.error('Error updating case status:', updateError)
    return { error: 'Error al actualizar el estado del caso' }
  }

  // Note: case_updates insert removed temporarily due to schema issues
  // TODO: Add back when case_updates table is fixed
  const message = getStatusTransitionMessage(currentCase.status, newStatus as any)

  revalidatePath(`/casos/${caseId}`)
  revalidatePath('/casos')
  revalidatePath('/mis-casos')

  return { 
    success: true, 
    message 
  }
}

export async function archiveCase(caseId: string) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'Debes iniciar sesión' }
  }

  // Check permissions
  const { getCurrentUserContext } = await import('@/app/lib/auth/permissions')
  const context = await getCurrentUserContext()
  if (!context) return { error: 'No autorizado' }

  // Get case
  const { data: caseData, error: fetchError } = await supabase
    .from('cases')
    .select('status, created_by')
    .eq('id', caseId)
    .single()

  if (fetchError || !caseData) return { error: 'Caso no encontrado' }

  // Only owner or admin can archive
  if (context.role !== 'admin' && context.userId !== caseData.created_by) {
    return { error: 'No tienes permiso para archivar este caso' }
  }

  // Only resolved or closed cases can be archived
  if (caseData.status !== 'resolved' && caseData.status !== 'closed') {
    return { error: 'Solo se pueden archivar casos resueltos o cerrados' }
  }

  const { error: updateError } = await supabase
    .from('cases')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', caseId)

  if (updateError) {
    return { error: 'Error al archivar el caso' }
  }

  revalidatePath('/casos')
  revalidatePath('/mis-casos')

  return { success: true, message: 'Caso archivado exitosamente' }
}

export async function getArchivedCases() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('cases')
    .select('*, case_photos(storage_url)')
    .not('archived_at', 'is', null)
    .order('archived_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { success: true, cases: data }
}
