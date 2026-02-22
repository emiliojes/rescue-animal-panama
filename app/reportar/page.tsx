'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { caseFormSchema, CaseFormInput } from '@/app/lib/validations/case-schema'
import Header from '@/app/components/layout/Header'
import FormStep from '@/app/components/forms/FormStep'
import CaseFormStep1 from '@/app/components/forms/CaseFormStep1'
import CaseFormStep2 from '@/app/components/forms/CaseFormStep2'
import CaseFormStep3 from '@/app/components/forms/CaseFormStep3'
import { ChevronLeft, ChevronRight, Send } from 'lucide-react'
import LoadingSpinner from '@/app/components/shared/LoadingSpinner'
import toast from 'react-hot-toast'

export default function ReportarPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [photos, setPhotos] = useState<File[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CaseFormInput>({
    mode: 'onChange',
    resolver: zodResolver(caseFormSchema) as any,
    defaultValues: {
      is_anonymous: false,
      consent_given: false,
    },
  })

  const totalSteps = 3

  const onSubmit = async (data: CaseFormInput) => {
    console.log('=== FORM SUBMIT STARTED ===')
    console.log('Form data:', data)
    console.log('Form errors:', errors)
    console.log('Photos:', photos)
    
    setSubmitting(true)
    
    try {
      console.log('Creating case...')
      // Create case
      const { createCase } = await import('@/app/actions/cases')
      const result = await createCase(data)
      
      console.log('Create case result:', result)

      if (result.error) {
        console.error('Server error:', result.error)
        toast.error(result.error)
        setSubmitting(false)
        return
      }

      if (!result.case) {
        console.error('No case returned')
        toast.error('Error al crear el caso')
        setSubmitting(false)
        return
      }

      console.log('Case created successfully:', result.case.id)

      // Upload photos if any
      if (photos.length > 0) {
        console.log('Uploading photos...')
        const { uploadCasePhoto } = await import('@/app/actions/cases')
        
        for (const photo of photos) {
          const uploadResult = await uploadCasePhoto(result.case.id, photo)
          if (uploadResult.error) {
            console.error('Error uploading photo:', uploadResult.error)
          }
        }
      }

      toast.success('¡Caso reportado exitosamente!')
      console.log('Redirecting to case:', result.case.id)
      
      // Small delay to ensure database has processed the case
      await new Promise(resolve => setTimeout(resolve, 500))
      router.push(`/casos/${result.case.id}`)
    } catch (error: any) {
      console.error('=== ERROR SUBMITTING CASE ===')
      console.error('Error:', error)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      toast.error(error.message || 'Error al crear el caso')
    } finally {
      setSubmitting(false)
      console.log('=== FORM SUBMIT ENDED ===')
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    if (currentStep === 1) {
      const { case_type, species, urgency, title, description } = watch()
      const canGo = case_type && species && urgency && title && description
      console.log('Step 1 validation:', { case_type, species, urgency, title, description, canGo })
      return canGo
    }
    if (currentStep === 2) {
      const { exact_lat, exact_lng } = watch()
      const canGo = exact_lat && exact_lng
      console.log('Step 2 validation:', { exact_lat, exact_lng, canGo })
      return canGo
    }
    if (currentStep === 3) {
      const { consent_given } = watch()
      console.log('Step 3 validation:', { consent_given })
      return consent_given === true
    }
    return false
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-3xl mx-auto px-4 py-12">
        <form onSubmit={handleSubmit(onSubmit as any)}>
          <div className="bg-card-bg p-8 rounded-xl border border-border shadow-sm">
            {currentStep === 1 && (
              <FormStep
                step={1}
                totalSteps={totalSteps}
                title="Información del Caso"
                description="Cuéntanos qué tipo de ayuda necesita el animal"
              >
                <CaseFormStep1 register={register} errors={errors} />
              </FormStep>
            )}

            {currentStep === 2 && (
              <FormStep
                step={2}
                totalSteps={totalSteps}
                title="Ubicación"
                description="¿Dónde se encuentra el animal?"
              >
                <CaseFormStep2 setValue={setValue} watch={watch} />
              </FormStep>
            )}

            {currentStep === 3 && (
              <FormStep
                step={3}
                totalSteps={totalSteps}
                title="Fotos y Confirmación"
                description="Agrega fotos y confirma tu reporte"
              >
                <CaseFormStep3 register={register} setValue={setValue} watch={watch} photos={photos} setPhotos={setPhotos} />
              </FormStep>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-6 py-3 border border-border rounded-lg font-medium hover:bg-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
                Anterior
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!canProceed() || submitting}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Enviar Reporte
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
