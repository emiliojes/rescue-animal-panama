'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CaseStatus, CASE_STATUS } from '@/app/lib/constants'
import { getValidNextStatuses } from '@/app/lib/validations/case-lifecycle'
import { updateCaseStatus } from '@/app/actions/cases'
import { CheckCircle, XCircle, AlertCircle, Archive, Flag } from 'lucide-react'
import toast from 'react-hot-toast'

interface CaseStatusSelectorProps {
  caseId: string
  currentStatus: CaseStatus
  canUpdate: boolean
}

const STATUS_LABELS: { [key in CaseStatus]: string } = {
  new: 'Nuevo',
  under_review: 'En Revisión',
  in_progress: 'En Progreso',
  resolved: 'Resuelto',
  closed: 'Cerrado',
  spam: 'Spam/Falso'
}

const STATUS_ICONS: { [key in CaseStatus]: React.ReactNode } = {
  new: <AlertCircle className="w-4 h-4" />,
  under_review: <AlertCircle className="w-4 h-4" />,
  in_progress: <CheckCircle className="w-4 h-4" />,
  resolved: <CheckCircle className="w-4 h-4" />,
  closed: <Archive className="w-4 h-4" />,
  spam: <Flag className="w-4 h-4" />
}

export default function CaseStatusSelector({ caseId, currentStatus, canUpdate }: CaseStatusSelectorProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<CaseStatus>(currentStatus)

  const validNextStatuses = getValidNextStatuses(currentStatus)

  const handleStatusChange = async (newStatus: CaseStatus) => {
    if (!canUpdate || newStatus === currentStatus) return

    const confirmed = confirm(`¿Estás seguro de cambiar el estado a "${STATUS_LABELS[newStatus]}"?`)
    if (!confirmed) return

    setIsUpdating(true)

    try {
      const result = await updateCaseStatus(caseId, newStatus)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(result.message || 'Estado actualizado')
        setSelectedStatus(newStatus)
        // Refresh data without full page reload
        router.refresh()
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar estado')
    } finally {
      setIsUpdating(false)
    }
  }

  if (!canUpdate) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted">Estado actual:</span>
        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
          {STATUS_ICONS[currentStatus]}
          {STATUS_LABELS[currentStatus]}
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted">Estado actual:</span>
        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
          {STATUS_ICONS[selectedStatus]}
          {STATUS_LABELS[selectedStatus]}
        </span>
      </div>

      {validNextStatuses.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Cambiar estado a:
          </label>
          <div className="flex flex-wrap gap-2">
            {validNextStatuses.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={isUpdating}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border hover:bg-primary/5 hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {STATUS_ICONS[status]}
                {STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>
      )}

      {validNextStatuses.length === 0 && (
        <p className="text-sm text-muted">
          Este caso está en estado final. No se pueden hacer más cambios de estado.
        </p>
      )}
    </div>
  )
}
