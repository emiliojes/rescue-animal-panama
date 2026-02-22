'use client'

import { AlertTriangle, Siren } from 'lucide-react'

interface UrgentCaseBannerProps {
  urgency: string
  title: string
}

export default function UrgentCaseBanner({ urgency, title }: UrgentCaseBannerProps) {
  if (urgency !== 'high' && urgency !== 'critical') {
    return null
  }

  const isCritical = urgency === 'critical'

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border ${
        isCritical
          ? 'bg-red-500/10 border-red-500/30 text-red-400'
          : 'bg-orange-500/10 border-orange-500/30 text-orange-400'
      }`}
    >
      {isCritical ? (
        <Siren className="w-5 h-5 flex-shrink-0 animate-pulse" />
      ) : (
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold">
          {isCritical ? '🚨 URGENCIA CRÍTICA' : '⚠️ URGENCIA ALTA'}
        </p>
        <p className="text-xs opacity-80 truncate">
          {isCritical
            ? 'Este caso requiere atención inmediata'
            : 'Este caso necesita atención prioritaria'}
        </p>
      </div>
    </div>
  )
}
