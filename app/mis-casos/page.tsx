'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/layout/Header'
import UrgencyBadge from '@/app/components/shared/UrgencyBadge'
import StatusBadge from '@/app/components/shared/StatusBadge'
import LoadingSpinner from '@/app/components/shared/LoadingSpinner'
import { useAuthContext } from '@/app/components/auth/AuthProvider'
import { MapPin, Calendar, CheckCircle, AlertCircle } from 'lucide-react'
import { CASE_TYPE_LABELS, SPECIES_LABELS, STATUS_LABELS } from '@/app/lib/constants'
import { getTimeAgo } from '@/app/lib/utils/format'
import toast from 'react-hot-toast'

export default function MisCasosPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuthContext()
  const [cases, setCases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    const fetchMyCases = async () => {
      try {
        const { getMyCases } = await import('@/app/actions/claims')
        const result = await getMyCases()

        if (result.error) {
          setError(result.error)
        } else {
          setCases(result.cases || [])
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMyCases()
  }, [user, authLoading, router])

  const handleStatusUpdate = async (caseId: string, newStatus: string) => {
    setUpdatingStatus(caseId)

    try {
      const { updateCaseStatus } = await import('@/app/actions/claims')
      const result = await updateCaseStatus(caseId, newStatus)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Estado actualizado exitosamente')
        // Update local state
        setCases(cases.map(c => c.id === caseId ? { ...c, status: newStatus } : c))
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar el estado')
    } finally {
      setUpdatingStatus(null)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Mis Casos</h1>
          <p className="text-muted mt-2">Gestiona los casos que has tomado</p>
        </div>

        {error && (
          <div className="p-6 bg-danger/10 border border-danger/20 rounded-lg mb-6">
            <p className="text-danger">{error}</p>
          </div>
        )}

        {!loading && !error && cases.length === 0 && (
          <div className="text-center py-12 bg-card-bg border border-border rounded-xl">
            <AlertCircle className="w-16 h-16 text-muted mx-auto mb-4" />
            <p className="text-muted text-lg mb-4">No has tomado ningún caso aún</p>
            <Link
              href="/casos"
              className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-light transition-colors"
            >
              Ver Casos Disponibles
            </Link>
          </div>
        )}

        {!loading && !error && cases.length > 0 && (
          <div className="space-y-6">
            {cases.map((caso) => (
              <div
                key={caso.id}
                className="bg-card-bg border border-border rounded-xl overflow-hidden shadow-sm"
              >
                <div className="grid md:grid-cols-3 gap-6 p-6">
                  {/* Image */}
                  <div className="md:col-span-1">
                    {caso.case_photos && caso.case_photos.length > 0 ? (
                      <img
                        src={caso.case_photos[0].storage_url}
                        alt={caso.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-border flex items-center justify-center rounded-lg">
                        <MapPin className="w-12 h-12 text-muted" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <Link
                          href={`/casos/${caso.id}`}
                          className="text-xl font-bold text-foreground hover:text-primary transition-colors"
                        >
                          {caso.title}
                        </Link>
                        <UrgencyBadge urgency={caso.urgency} />
                      </div>

                      <p className="text-muted line-clamp-2">{caso.description}</p>

                      <div className="flex items-center gap-4 mt-3 text-sm text-muted">
                        <span className="font-medium">
                          {CASE_TYPE_LABELS[caso.case_type as keyof typeof CASE_TYPE_LABELS]}
                        </span>
                        <span>•</span>
                        <span>{SPECIES_LABELS[caso.species as keyof typeof SPECIES_LABELS]}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{getTimeAgo(caso.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Update */}
                    <div className="flex items-center gap-3 pt-4 border-t border-border">
                      <span className="text-sm font-medium text-foreground">Estado:</span>
                      <StatusBadge status={caso.status} />
                      
                      {caso.status !== 'resolved' && caso.status !== 'closed' && (
                        <div className="ml-auto flex gap-2">
                          {caso.status === 'new' && (
                            <button
                              onClick={() => handleStatusUpdate(caso.id, 'in_progress')}
                              disabled={updatingStatus === caso.id}
                              className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50"
                            >
                              {updatingStatus === caso.id ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                'Marcar En Proceso'
                              )}
                            </button>
                          )}
                          
                          {caso.status === 'in_progress' && (
                            <button
                              onClick={() => handleStatusUpdate(caso.id, 'resolved')}
                              disabled={updatingStatus === caso.id}
                              className="px-4 py-2 text-sm bg-success text-white rounded-lg hover:bg-success/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                              {updatingStatus === caso.id ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4" />
                                  Marcar Resuelto
                                </>
                              )}
                            </button>
                          )}

                          <Link
                            href={`/casos/${caso.id}`}
                            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-background transition-colors"
                          >
                            Ver Detalles
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
