import { createClient } from '@/app/lib/supabase/server'

export async function notifyRescuersOnUrgentCase(caseId: string, caseTitle: string, urgency: string) {
  // Only notify for high and critical urgency
  if (urgency !== 'high' && urgency !== 'critical') {
    return
  }

  const supabase = await createClient()

  // Get all rescuers and admins
  const { data: rescuers, error } = await supabase
    .from('profiles')
    .select('id')
    .in('role', ['rescuer', 'admin'])

  if (error || !rescuers || rescuers.length === 0) {
    console.warn('No rescuers found to notify')
    return
  }

  const urgencyLabel = urgency === 'critical' ? '🚨 CRÍTICA' : '⚠️ ALTA'

  // Create notifications for all rescuers
  const notifications = rescuers.map((rescuer) => ({
    user_id: rescuer.id,
    type: 'urgent_case',
    title: `${urgencyLabel} - Nuevo caso urgente`,
    message: `Se ha reportado "${caseTitle}" con urgencia ${urgencyLabel.toLowerCase()}. Se necesita atención inmediata.`,
    related_case_id: caseId,
    read: false,
  }))

  const { error: insertError } = await supabase
    .from('notifications')
    .insert(notifications)

  if (insertError) {
    console.error('Error notifying rescuers:', insertError)
  } else {
    console.log(`Notified ${rescuers.length} rescuers about urgent case`)
  }
}
