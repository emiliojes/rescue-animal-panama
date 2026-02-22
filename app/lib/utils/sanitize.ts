import DOMPurify from 'isomorphic-dompurify'

export function sanitizeComment(content: string): string {
  // Remover HTML tags peligrosos
  const clean = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [], // No permitir HTML
    ALLOWED_ATTR: []
  })
  
  // Limitar longitud
  return clean.trim().slice(0, 1000)
}

export function sanitizeText(text: string, maxLength: number = 500): string {
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  }).trim().slice(0, maxLength)
}

export function sanitizeHTML(html: string): string {
  // Permitir solo tags seguros para contenido rico
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href']
  })
}
