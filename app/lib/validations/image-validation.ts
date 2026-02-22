const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_IMAGES = 5

export interface ImageValidationResult {
  valid: boolean
  error?: string
}

export function validateImageFile(file: File): ImageValidationResult {
  // Validar tipo
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de archivo no permitido. Solo se permiten: JPEG, PNG, WebP`
    }
  }
  
  // Validar tamaño
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `La imagen es muy grande. Máximo ${MAX_IMAGE_SIZE / 1024 / 1024}MB`
    }
  }
  
  return { valid: true }
}

export function validateImageArray(files: File[]): ImageValidationResult {
  if (files.length > MAX_IMAGES) {
    return {
      valid: false,
      error: `Máximo ${MAX_IMAGES} imágenes permitidas`
    }
  }
  
  for (const file of files) {
    const result = validateImageFile(file)
    if (!result.valid) {
      return result
    }
  }
  
  return { valid: true }
}

export const IMAGE_VALIDATION = {
  ALLOWED_TYPES: ALLOWED_IMAGE_TYPES,
  MAX_SIZE: MAX_IMAGE_SIZE,
  MAX_COUNT: MAX_IMAGES
}
