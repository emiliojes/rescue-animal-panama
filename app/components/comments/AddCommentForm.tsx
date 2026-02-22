'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import LoadingSpinner from '@/app/components/shared/LoadingSpinner'
import toast from 'react-hot-toast'

interface AddCommentFormProps {
  caseId: string
  onCommentAdded: () => void
}

export default function AddCommentForm({ caseId, onCommentAdded }: AddCommentFormProps) {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      toast.error('Escribe un comentario')
      return
    }

    setSubmitting(true)

    try {
      const { addComment } = await import('@/app/actions/comments')
      const result = await addComment(caseId, content)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Comentario agregado')
        setContent('')
        onCommentAdded()
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al agregar comentario')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escribe un comentario... (mínimo 3 caracteres)"
        rows={3}
        maxLength={1000}
        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
        disabled={submitting}
      />
      
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">
          {content.length}/1000 caracteres
        </p>
        
        <button
          type="submit"
          disabled={submitting || content.trim().length < 3}
          className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <LoadingSpinner size="sm" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Comentar
            </>
          )}
        </button>
      </div>
    </form>
  )
}
