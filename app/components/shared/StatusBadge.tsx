import { CaseStatus } from '@/app/types/case.types'
import { CASE_STATUS, STATUS_LABELS } from '@/app/lib/constants'

interface StatusBadgeProps {
  status: CaseStatus
  className?: string
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const colors = {
    [CASE_STATUS.NEW]: 'bg-blue-100 text-blue-800 border-blue-300',
    [CASE_STATUS.UNDER_REVIEW]: 'bg-purple-100 text-purple-800 border-purple-300',
    [CASE_STATUS.IN_PROGRESS]: 'bg-orange-100 text-orange-800 border-orange-300',
    [CASE_STATUS.RESOLVED]: 'bg-green-100 text-green-800 border-green-300',
    [CASE_STATUS.CLOSED]: 'bg-gray-100 text-gray-800 border-gray-300',
    [CASE_STATUS.SPAM]: 'bg-red-100 text-red-800 border-red-300',
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status]} ${className}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
