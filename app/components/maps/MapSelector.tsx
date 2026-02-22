'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MapSelectorProps {
  lat: number
  lng: number
  onLocationSelect: (lat: number, lng: number) => void
}

export default function MapSelector({ lat, lng, onLocationSelect }: MapSelectorProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || mapRef.current) return

    // Initialize map
    const map = L.map('map-selector').setView([lat, lng], 13)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    // Custom marker icon
    const customIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    })

    // Add initial marker
    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map)
    markerRef.current = marker

    // Click event to update location
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng
      onLocationSelect(lat, lng)
      
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng])
      }
    })

    mapRef.current = map
    setMapReady(true)

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Update marker position when lat/lng props change
  useEffect(() => {
    if (mapReady && markerRef.current && mapRef.current) {
      markerRef.current.setLatLng([lat, lng])
      mapRef.current.setView([lat, lng], mapRef.current.getZoom())
    }
  }, [lat, lng, mapReady])

  return (
    <div
      id="map-selector"
      className="w-full h-96 rounded-lg border-2 border-border overflow-hidden"
    />
  )
}
