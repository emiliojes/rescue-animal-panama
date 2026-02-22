'use server'

import { createClient } from '@/app/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function claimCase(caseId: string) {
  console.log('=== CLAIM CASE START ===')
  console.log('Case ID:', caseId)
  
  const supabase = await createClient()

  // Get current user
  console.log('Step 1: Getting current user...')
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('User error:', userError)
    return { error: 'Debes iniciar sesión para tomar un caso' }
  }
  console.log('User ID:', user.id)

  // Check if user has rescuer role
  console.log('Step 2: Checking user role...')
  const { getCurrentUserContext, canClaimCase } = await import('@/app/lib/auth/permissions')
  const context = await getCurrentUserContext()
  console.log('User context:', context)

  if (!context || !canClaimCase(context)) {
    console.error('User cannot claim case. Context:', context)
    return { error: 'Solo los rescatistas verificados pueden tomar casos. Contacta al administrador para obtener permisos.' }
  }

  // Check if case exists and is available
  console.log('Step 3: Checking case availability...')
  const { data: caseData, error: caseError } = await supabase
    .from('cases')
    .select('id, status, claimed_by')
    .eq('id', caseId)
    .single()

  if (caseError) {
    console.error('Case error:', caseError)
    return { error: 'Caso no encontrado' }
  }
  console.log('Case data:', caseData)

  if (caseData.claimed_by) {
    console.error('Case already claimed by:', caseData.claimed_by)
    return { error: 'Este caso ya ha sido tomado por otro rescatista' }
  }

  if (caseData.status === 'resolved' || caseData.status === 'closed') {
    console.error('Case is closed. Status:', caseData.status)
    return { error: 'Este caso ya está cerrado' }
  }

  console.log('Step 4: Creating claim...')

  // Create claim
  const { data: claim, error: claimError } = await supabase
    .from('case_claims')
    .insert({
      case_id: caseId,
      rescuer_id: user.id,
      active: true,
    })
    .select()
    .single()

  if (claimError) {
    console.error('❌ CLAIM ERROR:', claimError)
    console.error('Error code:', claimError.code)
    console.error('Error message:', claimError.message)
    console.error('Error details:', claimError.details)
    console.error('Full error:', JSON.stringify(claimError, null, 2))
    return { error: `Error al tomar el caso: ${claimError.message}` }
  }

  console.log('✅ Claim created successfully:', claim)

  // Update case status and claimed_by
  console.log('Step 5: Updating case...')
  const { error: updateError } = await supabase
    .from('cases')
    .update({
      claimed_by: user.id,
      status: 'in_progress',
    })
    .eq('id', caseId)

  if (updateError) {
    console.error('❌ UPDATE CASE ERROR:', updateError)
    console.error('Error code:', updateError.code)
    console.error('Error message:', updateError.message)
    console.error('Error details:', updateError.details)
    console.error('Full error:', JSON.stringify(updateError, null, 2))
    return { error: `Error al actualizar el caso: ${updateError.message}` }
  }

  console.log('✅ Case updated successfully')
  console.log('Step 6: Revalidating paths...')

  revalidatePath(`/casos/${caseId}`)
  revalidatePath('/casos')
  revalidatePath('/mis-casos')

  console.log('✅ CLAIM CASE COMPLETE')
  return { success: true, claim }
}

export async function releaseCase(caseId: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'Debes iniciar sesión' }
  }

  // Check if user has claimed this case
  const { data: claim, error: claimError } = await supabase
    .from('case_claims')
    .select('*')
    .eq('case_id', caseId)
    .eq('rescuer_id', user.id)
    .eq('active', true)
    .single()

  if (claimError || !claim) {
    return { error: 'No has tomado este caso' }
  }

  // Update claim status
  const { error: updateClaimError } = await supabase
    .from('case_claims')
    .update({ active: false, released_at: new Date().toISOString() })
    .eq('id', claim.id)

  if (updateClaimError) {
    return { error: 'Error al liberar el caso' }
  }

  // Update case
  const { error: updateCaseError } = await supabase
    .from('cases')
    .update({
      claimed_by: null,
      status: 'new',
    })
    .eq('id', caseId)

  if (updateCaseError) {
    return { error: 'Error al actualizar el caso' }
  }

  // Note: case_updates insert removed temporarily due to schema issues
  // TODO: Add back when case_updates table is fixed

  revalidatePath(`/casos/${caseId}`)
  revalidatePath('/casos')
  revalidatePath('/mis-casos')

  return { success: true }
}

export async function updateCaseStatus(caseId: string, newStatus: string, note?: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'Debes iniciar sesión' }
  }

  // Get current case
  const { data: caseData, error: caseError } = await supabase
    .from('cases')
    .select('status, claimed_by')
    .eq('id', caseId)
    .single()

  if (caseError) {
    return { error: 'Caso no encontrado' }
  }

  // Check if user has claimed this case
  if (caseData.claimed_by !== user.id) {
    return { error: 'Solo puedes actualizar casos que hayas tomado' }
  }

  // Update case status
  const { error: updateError } = await supabase
    .from('cases')
    .update({ status: newStatus })
    .eq('id', caseId)

  if (updateError) {
    return { error: 'Error al actualizar el estado' }
  }

  // Create case update record
  await supabase.from('case_updates').insert({
    case_id: caseId,
    old_status: caseData.status,
    new_status: newStatus,
    note: note || `Estado actualizado a ${newStatus}`,
  })

  revalidatePath(`/casos/${caseId}`)
  revalidatePath('/casos')
  revalidatePath('/mis-casos')

  return { success: true }
}

export async function getMyCases() {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'Debes iniciar sesión' }
  }

  // Get cases claimed by user
  const { data, error } = await supabase
    .from('cases')
    .select('*, case_photos(storage_url)')
    .eq('claimed_by', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching my cases:', error)
    return { error: error.message }
  }

  return { success: true, cases: data }
}
