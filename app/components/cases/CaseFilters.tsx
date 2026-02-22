'use client'

import { CASE_TYPES, SPECIES_TYPES, URGENCY_LEVELS, CASE_STATUS, CASE_TYPE_LABELS, SPECIES_LABELS, URGENCY_LABELS, STATUS_LABELS } from '@/app/lib/constants'
import { Filter, X } from 'lucide-react'
import { useState } from 'react'

interface CaseFiltersProps {
  onFilterChange: (filters: FilterState) => void
  activeFilters: FilterState
}

export interface FilterState {
  case_type?: string
  species?: string
  urgency?: string
  status?: string
}

export default function CaseFilters({ onFilterChange, activeFilters }: CaseFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...activeFilters }
    
    if (newFilters[key] === value) {
      delete newFilters[key]
    } else {
      newFilters[key] = value
    }
    
    onFilterChange(newFilters)
  }

  const clearAllFilters = () => {
    onFilterChange({})
  }

  const activeFilterCount = Object.keys(activeFilters).length

  return (
    <div className="bg-card-bg border border-border rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 font-semibold text-foreground hover:text-primary transition-colors"
        >
          <Filter className="w-5 h-5" />
          Filtros
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-sm text-danger hover:underline"
          >
            <X className="w-4 h-4" />
            Limpiar
          </button>
        )}
      </div>

      {/* Filters */}
      {isOpen && (
        <div className="space-y-6 pt-4 border-t border-border">
          {/* Case Type */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Tipo de Caso</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(CASE_TYPES).map((type) => (
                <button
                  key={type}
                  onClick={() => handleFilterChange('case_type', type)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    activeFilters.case_type === type
                      ? 'bg-primary text-white border-primary'
                      : 'bg-background border-border hover:border-primary'
                  }`}
                >
                  {CASE_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Species */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Especie</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(SPECIES_TYPES).map((species) => (
                <button
                  key={species}
                  onClick={() => handleFilterChange('species', species)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    activeFilters.species === species
                      ? 'bg-primary text-white border-primary'
                      : 'bg-background border-border hover:border-primary'
                  }`}
                >
                  {SPECIES_LABELS[species]}
                </button>
              ))}
            </div>
          </div>

          {/* Urgency */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Urgencia</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(URGENCY_LEVELS).map((urgency) => (
                <button
                  key={urgency}
                  onClick={() => handleFilterChange('urgency', urgency)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    activeFilters.urgency === urgency
                      ? 'bg-primary text-white border-primary'
                      : 'bg-background border-border hover:border-primary'
                  }`}
                >
                  {URGENCY_LABELS[urgency]}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Estado</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(CASE_STATUS).map((status) => (
                <button
                  key={status}
                  onClick={() => handleFilterChange('status', status)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    activeFilters.status === status
                      ? 'bg-primary text-white border-primary'
                      : 'bg-background border-border hover:border-primary'
                  }`}
                >
                  {STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
