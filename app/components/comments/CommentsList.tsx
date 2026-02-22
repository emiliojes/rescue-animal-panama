'use client'

import { useState } from 'react'
import { MessageSquare, Trash2, Flag } from 'lucide-react'
import { getTimeAgo } from '@/app/lib/utils/format'
import LoadingSpinner from '@/app/components/shared/LoadingSpinner'
import toast from 'react-hot-toast'

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: {
    name: string
  }
}

interface CommentsListProps {
  comments: Comment[]
  currentUserId: string | null
  onCommentDeleted: () => void
}

export default function CommentsList({ comments, currentUserId, onCommentDeleted }: CommentsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [flaggingId, setFlaggingId] = useState<string | null>(null)

  const handleDelete = async (commentId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      return
    }

    setDeletingId(commentId)

    try {
      const { deleteComment } = await import('@/app/actions/comments')
      const result = await deleteComment(commentId)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Comentario eliminado')
        onCommentDeleted()
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar')
    } finally {
      setDeletingId(null)
    }
  }

  const handleFlag = async (commentId: string) => {
    const reason = prompt('¿Por qué reportas este comentario?')
    if (!reason) return

    setFlaggingId(commentId)

    try {
      const { flagComment } = await import('@/app/actions/comments')
      const result = await flagComment(commentId, reason)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Comentario reportado')
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al reportar')
    } finally {
      setFlaggingId(null)
    }
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted">
        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No hay comentarios aún. Sé el primero en comentar.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="bg-background border border-border rounded-lg p-4"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1">
              <p className="font-semibold text-foreground">
                {comment.profiles?.name || 'Usuario'}
              </p>
              <p className="text-xs text-muted">{getTimeAgo(comment.created_at)}</p>
            </div>

            {currentUserId && (
              <div className="flex items-center gap-2">
                {comment.user_id === currentUserId ? (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    disabled={deletingId === comment.id}
                    className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors disabled:opacity-50"
                    title="Eliminar comentario"
                  >
                    {deletingId === comment.id ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => handleFlag(comment.id)}
                    disabled={flaggingId === comment.id}
                    className="p-2 text-warning hover:bg-warning/10 rounded-lg transition-colors disabled:opacity-50"
                    title="Reportar comentario"
                  >
                    {flaggingId === comment.id ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Flag className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          <p className="text-foreground whitespace-pre-wrap">{comment.content}</p>
        </div>
      ))}
    </div>
  )
}
