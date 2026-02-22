'use server'

import { createClient } from '@/app/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sanitizeComment } from '@/app/lib/utils/sanitize'

export async function addComment(caseId: string, content: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'Debes iniciar sesión para comentar' }
  }

  // Rate limiting - max 10 comments per 10 minutes
  const { checkRateLimit, COMMENT_RATE_LIMIT } = await import('@/app/lib/utils/rate-limit')
  const rateCheck = await checkRateLimit(user.id, COMMENT_RATE_LIMIT)
  if (!rateCheck.allowed) {
    return { error: rateCheck.error }
  }

  // Sanitizar contenido primero
  const sanitizedContent = sanitizeComment(content)

  // Validate content después de sanitizar
  if (!sanitizedContent || sanitizedContent.length < 3) {
    return { error: 'El comentario debe tener al menos 3 caracteres' }
  }

  console.log('Adding comment:', { caseId, userId: user.id, content: sanitizedContent })

  // Insert comment - using explicit column names
  const { data: comment, error: insertError } = await supabase
    .from('comments')
    .insert([{
      case_id: caseId,
      user_id: user.id,
      content: sanitizedContent,
      flagged: false,
    }])
    .select()
    .single()

  if (insertError) {
    console.error('Error creating comment:', insertError)
    console.error('Error code:', insertError.code)
    console.error('Error details:', insertError.details)
    console.error('Error hint:', insertError.hint)
    return { error: `Error: ${insertError.message} (${insertError.code})` }
  }

  console.log('Comment created successfully:', comment)

  // Get commenter name separately
  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .single()

  const commentWithProfile = {
    ...comment,
    profiles: profile
  }

  revalidatePath(`/casos/${caseId}`)

  return { success: true, comment: commentWithProfile }
}

export async function getComments(caseId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('comments')
    .select('*, profiles(name)')
    .eq('case_id', caseId)
    .eq('flagged', false)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching comments:', error)
    return { error: error.message }
  }

  return { success: true, comments: data }
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'Debes iniciar sesión' }
  }

  // Check if user owns the comment
  const { data: comment, error: fetchError } = await supabase
    .from('comments')
    .select('user_id, case_id')
    .eq('id', commentId)
    .single()

  if (fetchError || !comment) {
    return { error: 'Comentario no encontrado' }
  }

  if (comment.user_id !== user.id) {
    return { error: 'Solo puedes eliminar tus propios comentarios' }
  }

  // Delete comment
  const { error: deleteError } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)

  if (deleteError) {
    console.error('Error deleting comment:', deleteError)
    return { error: 'Error al eliminar el comentario' }
  }

  revalidatePath(`/casos/${comment.case_id}`)

  return { success: true }
}

export async function flagComment(commentId: string, reason: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'Debes iniciar sesión para reportar' }
  }

  // Get comment
  const { data: comment, error: fetchError } = await supabase
    .from('comments')
    .select('case_id')
    .eq('id', commentId)
    .single()

  if (fetchError || !comment) {
    return { error: 'Comentario no encontrado' }
  }

  // Rate limiting - max 10 flags per hour
  const { checkRateLimit, FLAG_RATE_LIMIT, checkFlagThreshold } = await import('@/app/lib/utils/rate-limit')
  const rateCheck = await checkRateLimit(user.id, FLAG_RATE_LIMIT)
  if (!rateCheck.allowed) {
    return { error: rateCheck.error }
  }

  // Check if user already flagged this comment
  const { data: existingFlag } = await supabase
    .from('flags')
    .select('id')
    .eq('comment_id', commentId)
    .eq('user_id', user.id)
    .single()

  if (existingFlag) {
    return { error: 'Ya has reportado este comentario' }
  }

  // Create flag
  const { error: flagError } = await supabase
    .from('flags')
    .insert({
      comment_id: commentId,
      user_id: user.id,
      reason: reason,
    })

  if (flagError) {
    console.error('Error flagging comment:', flagError)
    return { error: 'Error al reportar el comentario' }
  }

  // Auto-hide comment if it reaches the flag threshold (3 flags)
  const shouldHide = await checkFlagThreshold(commentId, 'comment')
  if (shouldHide) {
    await supabase
      .from('comments')
      .update({ flagged: true })
      .eq('id', commentId)
  }

  revalidatePath(`/casos/${comment.case_id}`)

  return { success: true, hidden: shouldHide }
}
