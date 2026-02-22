import { createClient } from '@/app/lib/supabase/server'

export type UserRole = 'admin' | 'rescuer' | 'reporter' | 'public'

export interface PermissionContext {
  userId: string
  role: UserRole
}

export async function getUserRole(userId: string): Promise<UserRole> {
  const supabase = await createClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  
  return (profile?.role as UserRole) || 'public'
}

export async function getCurrentUserContext(): Promise<PermissionContext | null> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }
  
  const role = await getUserRole(user.id)
  
  return {
    userId: user.id,
    role,
  }
}

export function canViewSensitiveData(context: PermissionContext, caseData: {
  created_by?: string | null
  claimed_by?: string | null
}): boolean {
  // Admin puede ver todo
  if (context.role === 'admin') {
    return true
  }
  
  // Dueño del caso puede ver
  if (caseData.created_by && context.userId === caseData.created_by) {
    return true
  }
  
  // Rescatista que tomó el caso puede ver
  if (caseData.claimed_by && context.userId === caseData.claimed_by) {
    return true
  }
  
  return false
}

export function canEditCase(context: PermissionContext, caseOwnerId: string): boolean {
  if (context.role === 'admin') {
    return true
  }
  
  return context.userId === caseOwnerId
}

export function canClaimCase(context: PermissionContext): boolean {
  return context.role === 'rescuer' || context.role === 'admin'
}

export function canModerateContent(context: PermissionContext): boolean {
  return context.role === 'admin'
}
