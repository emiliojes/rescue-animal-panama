'use client'

import { useState, useEffect } from 'react'
import { UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { CaseFormInput } from '@/app/lib/validations/case-schema'
import { MapPin, Loader } from 'lucide-react'
import dynamic from 'next/dynamic'

const MapSelector = dynamic(() => import('@/app/components/maps/MapSelector'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-border rounded-lg flex items-center justify-center">
      <Loader className="w-8 h-8 text-primary animate-spin" />
    </div>
  ),
})

interface CaseFormStep2Props {
  setValue: UseFormSetValue<CaseFormInput>
  watch: UseFormWatch<CaseFormInput>
}

export default function CaseFormStep2({ setValue, watch }: CaseFormStep2Props) {
  const [useCurrentLocation, setUseCurrentLocation] = useState(false)
  const [loadingLocation, setLoadingLocation] = useState(false)
  
  const exactLat = watch('exact_lat')
  const exactLng = watch('exact_lng')
  const address = watch('address')

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización')
      return
    }

    setLoadingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue('exact_lat', position.coords.latitude)
        setValue('exact_lng', position.coords.longitude)
        setUseCurrentLocation(true)
        setLoadingLocation(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        alert('No se pudo obtener tu ubicación. Por favor selecciona manualmente en el mapa.')
        setLoadingLocation(false)
      }
    )
  }

  const handleMapClick = (lat: number, lng: number) => {
    setValue('exact_lat', lat)
    setValue('exact_lng', lng)
    setUseCurrentLocation(false)
  }

  return (
    <div className="space-y-6">
      {/* Current Location Button */}
      <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-primary" />
          <div>
            <p className="font-medium text-foreground">Usar mi ubicación actual</p>
            <p className="text-sm text-muted">Detectar automáticamente donde estoy</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={loadingLocation}
          className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
        >
          {loadingLocation ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            'Usar ubicación'
          )}
        </button>
      </div>

      {/* Map */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Ubicación del Caso *
        </label>
        <p className="text-sm text-muted mb-3">
          Haz click en el mapa para marcar la ubicación exacta donde se encuentra el animal.
          Tu ubicación exacta solo será visible para rescatistas verificados.
        </p>
        <MapSelector
          lat={exactLat || 8.9824}
          lng={exactLng || -79.5199}
          onLocationSelect={handleMapClick}
        />
      </div>

      {/* Selected Coordinates */}
      {exactLat && exactLng && (
        <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
          <p className="text-sm font-medium text-success mb-1">✓ Ubicación seleccionada</p>
          <p className="text-xs text-muted">
            Lat: {exactLat.toFixed(6)}, Lng: {exactLng.toFixed(6)}
          </p>
        </div>
      )}

      {/* Address (Optional) */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-foreground mb-2">
          Dirección o Referencia (Opcional)
        </label>
        <input
          id="address"
          type="text"
          value={address || ''}
          onChange={(e) => setValue('address', e.target.value)}
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Ej: Frente al supermado Rey, Calle 50"
        />
        <p className="mt-1 text-xs text-muted">
          Ayuda a los rescatistas a encontrar el lugar más fácilmente
        </p>
      </div>
    </div>
  )
}
