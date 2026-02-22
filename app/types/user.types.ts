import { USER_ROLES } from '@/app/lib/constants'

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

export interface Profile {
  id: string
  name: string
  role: UserRole
  phone: string | null
  organization: string | null
  verified: boolean
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}
