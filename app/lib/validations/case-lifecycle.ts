import { CaseStatus } from '@/app/lib/constants'

// Define valid state transitions
// New → Under Review → In Progress → Resolved
//                           → Closed
//                           → False/Spam

type StatusTransition = {
  [key in CaseStatus]?: CaseStatus[]
}

const VALID_TRANSITIONS: StatusTransition = {
  new: ['under_review', 'closed', 'spam'],
  under_review: ['in_progress', 'closed', 'spam'],
  in_progress: ['resolved', 'closed', 'spam'],
  resolved: ['closed'],
  closed: [], // Terminal state - no transitions allowed
  spam: [], // Terminal state - no transitions allowed
}

export interface LifecycleValidationResult {
  valid: boolean
  error?: string
}

export function validateStatusTransition(
  currentStatus: CaseStatus,
  newStatus: CaseStatus
): LifecycleValidationResult {
  // Same status is always valid (no-op)
  if (currentStatus === newStatus) {
    return { valid: true }
  }

  // Check if transition is allowed
  const allowedTransitions = VALID_TRANSITIONS[currentStatus] || []
  
  if (!allowedTransitions.includes(newStatus)) {
    return {
      valid: false,
      error: `No se puede cambiar el estado de "${getStatusLabel(currentStatus)}" a "${getStatusLabel(newStatus)}". Transición no permitida.`
    }
  }

  return { valid: true }
}

export function getValidNextStatuses(currentStatus: CaseStatus): CaseStatus[] {
  return VALID_TRANSITIONS[currentStatus] || []
}

export function isTerminalStatus(status: CaseStatus): boolean {
  return status === 'closed' || status === 'spam'
}

function getStatusLabel(status: CaseStatus): string {
  const labels: { [key in CaseStatus]: string } = {
    new: 'Nuevo',
    under_review: 'En Revisión',
    in_progress: 'En Progreso',
    resolved: 'Resuelto',
    closed: 'Cerrado',
    spam: 'Spam/Falso'
  }
  return labels[status] || status
}

export function getStatusTransitionMessage(from: CaseStatus, to: CaseStatus): string {
  const messages: { [key: string]: string } = {
    'new->under_review': 'Caso movido a revisión',
    'under_review->in_progress': 'Caso en progreso',
    'in_progress->resolved': 'Caso resuelto exitosamente',
    'resolved->closed': 'Caso archivado',
    'new->spam': 'Caso marcado como spam',
    'under_review->spam': 'Caso marcado como spam',
    'in_progress->spam': 'Caso marcado como spam',
    'new->closed': 'Caso cerrado',
    'under_review->closed': 'Caso cerrado',
    'in_progress->closed': 'Caso cerrado',
  }
  
  const key = `${from}->${to}`
  return messages[key] || `Estado cambiado de ${getStatusLabel(from)} a ${getStatusLabel(to)}`
}
