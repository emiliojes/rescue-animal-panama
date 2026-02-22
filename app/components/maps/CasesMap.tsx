'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { URGENCY_LABELS } from '@/app/lib/constants'

interface CaseMarker {
  id: string
  lat: number
  lng: number
  title: string
  urgency: string
  case_type: string
  species: string
}

interface CasesMapProps {
  cases: CaseMarker[]
  onMarkerClick?: (caseId: string) => void
  center?: [number, number]
  zoom?: number
}

export default function CasesMap({ 
  cases, 
  onMarkerClick,
  center = [8.9824, -79.5199], // Panama City
  zoom = 12 
}: CasesMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const [mapReady, setMapReady] = useState(false)

  // Initialize map
  useEffect(() => {
    if (typeof window === 'undefined' || mapRef.current) return

    const map = L.map('cases-map').setView(center, zoom)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    mapRef.current = map
    setMapReady(true)

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Update markers when cases change
  useEffect(() => {
    if (!mapReady || !mapRef.current) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Add new markers
    cases.forEach(caseItem => {
      if (!caseItem.lat || !caseItem.lng) return

      // Choose icon color based on urgency
      const iconColor = getUrgencyColor(caseItem.urgency)
      
      const customIcon = L.icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${iconColor}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })

      const marker = L.marker([caseItem.lat, caseItem.lng], { icon: customIcon })
        .addTo(mapRef.current!)

      // Create popup content
      const popupContent = `
        <div class="p-2">
          <h3 class="font-bold text-sm mb-1">${caseItem.title}</h3>
          <p class="text-xs text-gray-600 mb-2">
            ${URGENCY_LABELS[caseItem.urgency as keyof typeof URGENCY_LABELS]}
          </p>
          <button 
            onclick="window.dispatchEvent(new CustomEvent('case-marker-click', { detail: '${caseItem.id}' }))"
            class="text-xs bg-primary text-white px-3 py-1 rounded hover:bg-primary-light transition-colors"
          >
            Ver Detalles
          </button>
        </div>
      `

      marker.bindPopup(popupContent)
      markersRef.current.push(marker)
    })

    // Fit bounds to show all markers
    if (cases.length > 0) {
      const bounds = L.latLngBounds(cases.map(c => [c.lat, c.lng]))
      mapRef.current.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [cases, mapReady])

  // Listen for marker click events
  useEffect(() => {
    const handleMarkerClick = (event: any) => {
      if (onMarkerClick) {
        onMarkerClick(event.detail)
      }
    }

    window.addEventListener('case-marker-click', handleMarkerClick)
    return () => window.removeEventListener('case-marker-click', handleMarkerClick)
  }, [onMarkerClick])

  return (
    <div
      id="cases-map"
      className="w-full h-[600px] rounded-xl border-2 border-border overflow-hidden shadow-sm"
    />
  )
}

function getUrgencyColor(urgency: string): string {
  switch (urgency) {
    case 'critical':
      return 'red'
    case 'high':
      return 'orange'
    case 'medium':
      return 'yellow'
    case 'low':
      return 'green'
    default:
      return 'blue'
  }
}
