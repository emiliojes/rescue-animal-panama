import { UrgencyLevel } from '@/app/types/case.types'
import { URGENCY_LEVELS, URGENCY_LABELS } from '@/app/lib/constants'

interface UrgencyBadgeProps {
  urgency: UrgencyLevel
  className?: string
}

export default function UrgencyBadge({ urgency, className = '' }: UrgencyBadgeProps) {
  const colors = {
    [URGENCY_LEVELS.LOW]: 'bg-gray-100 text-gray-800 border-gray-300',
    [URGENCY_LEVELS.MEDIUM]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    [URGENCY_LEVELS.HIGH]: 'bg-orange-100 text-orange-800 border-orange-300',
    [URGENCY_LEVELS.CRITICAL]: 'bg-red-100 text-red-800 border-red-300',
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[urgency]} ${className}`}
    >
      {URGENCY_LABELS[urgency]}
    </span>
  )
}
