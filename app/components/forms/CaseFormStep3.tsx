'use client'

import { useState } from 'react'
import { UseFormSetValue, UseFormWatch, UseFormRegister } from 'react-hook-form'
import { CaseFormInput } from '@/app/lib/validations/case-schema'
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { MAX_PHOTO_SIZE, MAX_PHOTOS_PER_CASE } from '@/app/lib/constants'
import { validateImageArray } from '@/app/lib/validations/image-validation'

interface CaseFormStep3Props {
  register: UseFormRegister<CaseFormInput>
  setValue: UseFormSetValue<CaseFormInput>
  watch: UseFormWatch<CaseFormInput>
  photos: File[]
  setPhotos: (photos: File[]) => void
}

export default function CaseFormStep3({ register, setValue, watch, photos, setPhotos }: CaseFormStep3Props) {
  const [previews, setPreviews] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  
  const isAnonymous = watch('is_anonymous')
  const consentGiven = watch('consent_given')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setError(null)

    // Validar todas las imágenes con el nuevo sistema
    const allFiles = [...photos, ...files]
    const validationResult = validateImageArray(allFiles)
    
    if (!validationResult.valid) {
      setError(validationResult.error || 'Error al validar imágenes')
      return
    }

    const validFiles: File[] = []
    const newPreviews: string[] = []

    files.forEach((file) => {
      validFiles.push(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviews.push(reader.result as string)
        if (newPreviews.length === validFiles.length) {
          setPreviews([...previews, ...newPreviews])
        }
      }
      reader.readAsDataURL(file)
    })

    if (validFiles.length > 0) {
      setPhotos([...photos, ...validFiles])
    }
  }

  const removePhoto = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index)
    const newPhotos = photos.filter((_, i) => i !== index)
    setPreviews(newPreviews)
    setPhotos(newPhotos)
    setError(null)
  }

  return (
    <div className="space-y-6">
      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Fotos del Caso (Opcional)
        </label>
        <p className="text-sm text-muted mb-4">
          Las fotos ayudan a los rescatistas a evaluar mejor la situación. 
          Máximo {MAX_PHOTOS_PER_CASE} fotos, 5MB cada una.
        </p>

        {/* Upload Area */}
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
          <input
            type="file"
            id="photos"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            disabled={previews.length >= MAX_PHOTOS_PER_CASE}
          />
          <label
            htmlFor="photos"
            className={`cursor-pointer ${previews.length >= MAX_PHOTOS_PER_CASE ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Upload className="w-12 h-12 text-muted mx-auto mb-3" />
            <p className="text-foreground font-medium mb-1">
              Click para seleccionar fotos
            </p>
            <p className="text-sm text-muted">
              PNG, JPG, WEBP hasta 5MB
            </p>
          </label>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-danger/10 border border-danger/20 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        {/* Photo Previews */}
        {previews.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-border"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 p-1 bg-danger text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Information */}
      <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
        <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Información de Contacto (Opcional)
        </h3>
        <p className="text-sm text-muted mb-4">
          Si deseas que los rescatistas puedan contactarte directamente, proporciona tu información.
          Solo será visible para rescatistas verificados.
        </p>

        <div className="space-y-3">
          <div>
            <label htmlFor="contact_name" className="block text-sm font-medium text-foreground mb-2">
              Nombre de contacto
            </label>
            <input
              id="contact_name"
              type="text"
              onChange={(e) => setValue('contact_name', e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label htmlFor="contact_phone" className="block text-sm font-medium text-foreground mb-2">
              Teléfono
            </label>
            <input
              id="contact_phone"
              type="tel"
              onChange={(e) => setValue('contact_phone', e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="6000-0000"
            />
          </div>

          <div>
            <label htmlFor="contact_email" className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <input
              id="contact_email"
              type="email"
              onChange={(e) => setValue('contact_email', e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="tu@email.com"
            />
          </div>
        </div>
      </div>

      {/* Anonymous Option */}
      <div className="flex items-start gap-3 p-4 bg-card-bg border border-border rounded-lg">
        <input
          {...register('is_anonymous')}
          id="is_anonymous"
          type="checkbox"
          className="mt-1 w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
        />
        <label htmlFor="is_anonymous" className="flex-1 cursor-pointer">
          <span className="font-medium text-foreground">Reportar de forma anónima</span>
          <p className="text-sm text-muted mt-1">
            Tu identidad no será visible para nadie, ni siquiera para rescatistas.
          </p>
        </label>
      </div>

      {/* Consent */}
      <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <input
          {...register('consent_given')}
          id="consent_given"
          type="checkbox"
          className="mt-1 w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
        />
        <label htmlFor="consent_given" className="flex-1 cursor-pointer">
          <span className="font-medium text-foreground">Acepto los términos *</span>
          <p className="text-sm text-muted mt-1">
            Confirmo que la información proporcionada es verídica y autorizo su publicación 
            para fines de rescate animal. Entiendo que mi ubicación exacta solo será visible 
            para rescatistas verificados.
          </p>
        </label>
      </div>
    </div>
  )
}
