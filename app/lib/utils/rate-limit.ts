import { createClient } from '@/app/lib/supabase/server'

interface RateLimitConfig {
  maxAttempts: number
  windowMinutes: number
  table: string
  userColumn?: string
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  error?: string
}

// Rate limit for creating cases
export const CASE_RATE_LIMIT: RateLimitConfig = {
  maxAttempts: 5,
  windowMinutes: 60,
  table: 'cases',
  userColumn: 'created_by',
}

// Rate limit for comments
export const COMMENT_RATE_LIMIT: RateLimitConfig = {
  maxAttempts: 10,
  windowMinutes: 10,
  table: 'comments',
  userColumn: 'user_id',
}

// Rate limit for flags/reports
export const FLAG_RATE_LIMIT: RateLimitConfig = {
  maxAttempts: 10,
  windowMinutes: 60,
  table: 'flags',
  userColumn: 'user_id',
}

export async function checkRateLimit(
  userId: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const supabase = await createClient()

  const windowStart = new Date()
  windowStart.setMinutes(windowStart.getMinutes() - config.windowMinutes)

  const { count, error } = await supabase
    .from(config.table)
    .select('*', { count: 'exact', head: true })
    .eq(config.userColumn || 'user_id', userId)
    .gte('created_at', windowStart.toISOString())

  if (error) {
    console.error('Rate limit check error:', error)
    // Allow action if we can't check (fail open)
    return { allowed: true, remaining: config.maxAttempts }
  }

  const used = count || 0
  const remaining = Math.max(0, config.maxAttempts - used)

  if (used >= config.maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      error: `Has excedido el límite de ${config.maxAttempts} acciones en ${config.windowMinutes} minutos. Intenta más tarde.`,
    }
  }

  return { allowed: true, remaining }
}

// Auto-hide threshold for flags
export const FLAG_HIDE_THRESHOLD = 3

export async function checkFlagThreshold(
  targetId: string,
  targetType: 'case' | 'comment'
): Promise<boolean> {
  const supabase = await createClient()

  const column = targetType === 'case' ? 'case_id' : 'comment_id'

  const { count, error } = await supabase
    .from('flags')
    .select('*', { count: 'exact', head: true })
    .eq(column, targetId)

  if (error) {
    console.error('Flag threshold check error:', error)
    return false
  }

  return (count || 0) >= FLAG_HIDE_THRESHOLD
}
