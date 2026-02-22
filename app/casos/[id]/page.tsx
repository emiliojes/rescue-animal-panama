'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/app/components/layout/Header'
import UrgencyBadge from '@/app/components/shared/UrgencyBadge'
import StatusBadge from '@/app/components/shared/StatusBadge'
import LoadingSpinner from '@/app/components/shared/LoadingSpinner'
import ClaimCaseButton from '@/app/components/cases/ClaimCaseButton'
import CaseStatusSelector from '@/app/components/cases/CaseStatusSelector'
import UrgentCaseBanner from '@/app/components/cases/UrgentCaseBanner'
import CommentsList from '@/app/components/comments/CommentsList'
import AddCommentForm from '@/app/components/comments/AddCommentForm'
import { useAuthContext } from '@/app/components/auth/AuthProvider'
import { MapPin, Calendar, Phone, Mail, ArrowLeft, Share2, MessageSquare } from 'lucide-react'
import { CASE_TYPE_LABELS, SPECIES_LABELS } from '@/app/lib/constants'
import { getTimeAgo } from '@/app/lib/utils/format'

export default function CaseDetailPage() {
  const params = useParams()
  const { user, loading: authLoading } = useAuthContext()
  const [caseData, setCaseData] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchComments = async () => {
    try {
      const { getComments } = await import('@/app/actions/comments')
      const result = await getComments(params.id as string)
      
      if (!result.error && result.comments) {
        setComments(result.comments)
      }
    } catch (err) {
      console.error('Error fetching comments:', err)
    }
  }

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const { getCaseById } = await import('@/app/actions/cases')
        const result = await getCaseById(params.id as string)

        if (result.error) {
          setError(result.error)
        } else {
          setCaseData(result.case)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchCase()
      fetchComments()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (error || !caseData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="p-6 bg-danger/10 border border-danger/20 rounded-lg">
            <p className="text-danger">{error || 'Caso no encontrado'}</p>
          </div>
          <Link
            href="/casos"
            className="inline-flex items-center gap-2 mt-6 text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a casos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Back Button */}
        <Link
          href="/casos"
          className="inline-flex items-center gap-2 mb-6 text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a casos
        </Link>

        {/* Main Card */}
        <div className="bg-card-bg border border-border rounded-xl overflow-hidden shadow-sm">
          {/* Photos */}
          {caseData.case_photos && caseData.case_photos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4 bg-background">
              {caseData.case_photos.map((photo: any, index: number) => (
                <img
                  key={photo.id}
                  src={photo.storage_url}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-64 object-cover rounded-lg"
                />
              ))}
            </div>
          )}

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <h1 className="text-3xl font-bold text-foreground flex-1">
                  {caseData.title}
                </h1>
                <div className="flex flex-col gap-2">
                  <UrgencyBadge urgency={caseData.urgency} />
                  <StatusBadge status={caseData.status} />
                </div>
              </div>

              {/* Urgent Case Banner */}
              <UrgentCaseBanner urgency={caseData.urgency} title={caseData.title} />

              {/* Status Selector - only for authorized users */}
              {user && (user.id === caseData.created_by || caseData.claimed_by === user.id) && (
                <div className="p-4 bg-card-bg border border-border rounded-lg">
                  <CaseStatusSelector
                    caseId={caseData.id}
                    currentStatus={caseData.status}
                    canUpdate={true}
                  />
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-muted">
                <span className="font-medium">
                  {CASE_TYPE_LABELS[caseData.case_type as keyof typeof CASE_TYPE_LABELS]}
                </span>
                <span>•</span>
                <span>{SPECIES_LABELS[caseData.species as keyof typeof SPECIES_LABELS]}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{getTimeAgo(caseData.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Descripción</h2>
              <p className="text-foreground whitespace-pre-wrap">{caseData.description}</p>
            </div>

            {/* Location */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Ubicación</h2>
              <div className="flex items-start gap-2 text-muted">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  {caseData.address && <p className="font-medium">{caseData.address}</p>}
                  <p className="text-sm">
                    Ubicación aproximada: {caseData.public_lat?.toFixed(4)}, {caseData.public_lng?.toFixed(4)}
                  </p>
                  <p className="text-xs mt-1 text-muted">
                    La ubicación exacta solo es visible para rescatistas verificados
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Info (if available and user has permission) */}
            {(caseData.contact_name || caseData.contact_phone || caseData.contact_email) && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <h2 className="text-lg font-semibold text-foreground mb-3">Información de Contacto</h2>
                <div className="space-y-2">
                  {caseData.contact_name && (
                    <p className="text-foreground">
                      <span className="font-medium">Nombre:</span> {caseData.contact_name}
                    </p>
                  )}
                  {caseData.contact_phone && (
                    <div className="flex items-center gap-2 text-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{caseData.contact_phone}</span>
                    </div>
                  )}
                  {caseData.contact_email && (
                    <div className="flex items-center gap-2 text-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{caseData.contact_email}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <ClaimCaseButton
                caseId={caseData.id}
                claimedBy={caseData.claimed_by}
                currentUserId={user?.id || null}
                status={caseData.status}
              />
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  alert('Enlace copiado al portapapeles')
                }}
                className="px-6 py-3 border border-border rounded-lg font-semibold hover:bg-background transition-colors flex items-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Compartir
              </button>
            </div>
          </div>
        </div>

        {/* Updates Timeline (if any) */}
        {caseData.case_updates && caseData.case_updates.length > 0 && (
          <div className="mt-8 bg-card-bg border border-border rounded-xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Actualizaciones</h2>
            <div className="space-y-4">
              {caseData.case_updates.map((update: any) => (
                <div key={update.id} className="flex gap-3 pb-4 border-b border-border last:border-0">
                  <div className="flex-1">
                    {update.note && <p className="text-foreground">{update.note}</p>}
                    {update.new_status && (
                      <div className="mt-2">
                        <StatusBadge status={update.new_status} />
                      </div>
                    )}
                    <p className="text-sm text-muted mt-2">{getTimeAgo(update.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="mt-8 bg-card-bg border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">
              Comentarios ({comments.length})
            </h2>
          </div>

          {/* Add Comment Form */}
          {user ? (
            <div className="mb-6">
              <AddCommentForm 
                caseId={caseData.id} 
                onCommentAdded={fetchComments}
              />
            </div>
          ) : (
            <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg text-center">
              <p className="text-muted">
                <Link href="/login" className="text-primary font-semibold hover:underline">
                  Inicia sesión
                </Link>
                {' '}para comentar en este caso
              </p>
            </div>
          )}

          {/* Comments List */}
          <CommentsList 
            comments={comments}
            currentUserId={user?.id || null}
            onCommentDeleted={fetchComments}
          />
        </div>
      </div>
    </div>
  )
}
