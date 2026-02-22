'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle } from 'lucide-react'
import LoadingSpinner from '@/app/components/shared/LoadingSpinner'
import toast from 'react-hot-toast'

interface ClaimCaseButtonProps {
  caseId: string
  claimedBy: string | null
  currentUserId: string | null
  status: string
}

export default function ClaimCaseButton({ caseId, claimedBy, currentUserId, status }: ClaimCaseButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const isClaimed = !!claimedBy
  const isClaimedByMe = claimedBy === currentUserId
  const isClosed = status === 'resolved' || status === 'closed' || status === 'spam'

  const handleClaim = async () => {
    if (!currentUserId) {
      router.push('/login?redirect=/casos/' + caseId)
      return
    }

    setLoading(true)

    try {
      const { claimCase } = await import('@/app/actions/claims')
      const result = await claimCase(caseId)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('¡Caso tomado exitosamente!')
        router.refresh()
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al tomar el caso')
    } finally {
      setLoading(false)
    }
  }

  const handleRelease = async () => {
    if (!confirm('¿Estás seguro de que quieres liberar este caso?')) {
      return
    }

    setLoading(true)

    try {
      const { releaseCase } = await import('@/app/actions/claims')
      const result = await releaseCase(caseId)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Caso liberado exitosamente')
        router.refresh()
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al liberar el caso')
    } finally {
      setLoading(false)
    }
  }

  if (isClosed) {
    return (
      <div className="px-6 py-3 bg-muted text-muted rounded-lg text-center font-semibold">
        Caso Cerrado
      </div>
    )
  }

  if (isClaimedByMe) {
    return (
      <button
        onClick={handleRelease}
        disabled={loading}
        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-danger text-white rounded-lg font-semibold hover:bg-danger/90 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <>
            <LoadingSpinner size="sm" />
            Liberando...
          </>
        ) : (
          <>
            <XCircle className="w-5 h-5" />
            Liberar Caso
          </>
        )}
      </button>
    )
  }

  if (isClaimed) {
    return (
      <div className="px-6 py-3 bg-warning/20 text-warning border border-warning/40 rounded-lg text-center font-semibold">
        Caso tomado por otro rescatista
      </div>
    )
  }

  return (
    <button
      onClick={handleClaim}
      disabled={loading}
      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-light transition-colors disabled:opacity-50"
    >
      {loading ? (
        <>
          <LoadingSpinner size="sm" />
          Tomando caso...
        </>
      ) : (
        <>
          <CheckCircle className="w-5 h-5" />
          Tomar Caso
        </>
      )}
    </button>
  )
}
