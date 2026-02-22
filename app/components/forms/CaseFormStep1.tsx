'use client'

import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { CaseFormInput } from '@/app/lib/validations/case-schema'
import { CASE_TYPES, SPECIES_TYPES, URGENCY_LEVELS, CASE_TYPE_LABELS, SPECIES_LABELS, URGENCY_LABELS } from '@/app/lib/constants'

interface CaseFormStep1Props {
  register: UseFormRegister<CaseFormInput>
  errors: FieldErrors<CaseFormInput>
}

export default function CaseFormStep1({ register, errors }: CaseFormStep1Props) {
  return (
    <div className="space-y-6">
      {/* Tipo de Caso */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Tipo de Caso *
        </label>
        <div className="grid grid-cols-2 gap-3">
          {Object.values(CASE_TYPES).map((type) => (
            <label
              key={type}
              className="relative flex items-center p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary transition-colors"
            >
              <input
                type="radio"
                value={type}
                {...register('case_type')}
                className="sr-only peer"
              />
              <div className="flex-1 peer-checked:text-primary">
                <span className="font-medium">{CASE_TYPE_LABELS[type]}</span>
              </div>
              <div className="w-5 h-5 border-2 border-border rounded-full peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100" />
              </div>
            </label>
          ))}
        </div>
        {errors.case_type && (
          <p className="mt-1 text-sm text-danger">{errors.case_type.message}</p>
        )}
      </div>

      {/* Especie */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Especie *
        </label>
        <div className="grid grid-cols-2 gap-3">
          {Object.values(SPECIES_TYPES).map((species) => (
            <label
              key={species}
              className="relative flex items-center p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary transition-colors"
            >
              <input
                type="radio"
                value={species}
                {...register('species')}
                className="sr-only peer"
              />
              <div className="flex-1 peer-checked:text-primary">
                <span className="font-medium">{SPECIES_LABELS[species]}</span>
              </div>
              <div className="w-5 h-5 border-2 border-border rounded-full peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100" />
              </div>
            </label>
          ))}
        </div>
        {errors.species && (
          <p className="mt-1 text-sm text-danger">{errors.species.message}</p>
        )}
      </div>

      {/* Urgencia */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Nivel de Urgencia *
        </label>
        <div className="grid grid-cols-2 gap-3">
          {Object.values(URGENCY_LEVELS).map((urgency) => (
            <label
              key={urgency}
              className="relative flex items-center p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary transition-colors"
            >
              <input
                type="radio"
                value={urgency}
                {...register('urgency')}
                className="sr-only peer"
              />
              <div className="flex-1 peer-checked:text-primary">
                <span className="font-medium">{URGENCY_LABELS[urgency]}</span>
              </div>
              <div className="w-5 h-5 border-2 border-border rounded-full peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100" />
              </div>
            </label>
          ))}
        </div>
        {errors.urgency && (
          <p className="mt-1 text-sm text-danger">{errors.urgency.message}</p>
        )}
      </div>

      {/* Título */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
          Título del Caso *
        </label>
        <input
          id="title"
          type="text"
          {...register('title')}
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Ej: Perro abandonado en la calle 50"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-danger">{errors.title.message}</p>
        )}
        <p className="mt-1 text-xs text-muted">Mínimo 10 caracteres, máximo 100</p>
      </div>

      {/* Descripción */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
          Descripción Detallada *
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={5}
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          placeholder="Describe la situación con el mayor detalle posible: estado del animal, comportamiento, condiciones del lugar, etc."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-danger">{errors.description.message}</p>
        )}
        <p className="mt-1 text-xs text-muted">Mínimo 50 caracteres, máximo 2000</p>
      </div>
    </div>
  )
}
