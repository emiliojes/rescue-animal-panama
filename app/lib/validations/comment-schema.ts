import { z } from 'zod'

export const commentSchema = z.object({
  case_id: z.string().uuid(),
  content: z.string()
    .min(10, 'El comentario debe tener al menos 10 caracteres')
    .max(500, 'El comentario no puede exceder 500 caracteres'),
})

export type CommentInput = z.infer<typeof commentSchema>

export const flagSchema = z.object({
  case_id: z.string().uuid().optional(),
  comment_id: z.string().uuid().optional(),
  photo_id: z.string().uuid().optional(),
  reason: z.string()
    .min(10, 'Debes proporcionar una razón de al menos 10 caracteres')
    .max(200, 'La razón no puede exceder 200 caracteres'),
})

export type FlagInput = z.infer<typeof flagSchema>
