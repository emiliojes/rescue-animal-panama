import { UserRole } from '@/app/types/user.types'
import { USER_ROLES } from '@/app/lib/constants'

export function isRescuerOrAdmin(role: UserRole, verified: boolean): boolean {
  return verified && (role === USER_ROLES.RESCUER || role === USER_ROLES.ADMIN)
}

export function isAdmin(role: UserRole): boolean {
  return role === USER_ROLES.ADMIN
}

export function canViewSensitiveData(role: UserRole, verified: boolean): boolean {
  return isRescuerOrAdmin(role, verified)
}

export function canClaimCase(role: UserRole, verified: boolean): boolean {
  return isRescuerOrAdmin(role, verified)
}

export function canModerate(role: UserRole): boolean {
  return isAdmin(role)
}

export function canVerifyRescuers(role: UserRole): boolean {
  return isAdmin(role)
}
