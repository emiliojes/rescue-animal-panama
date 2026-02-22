'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/layout/Header'
import UrgencyBadge from '@/app/components/shared/UrgencyBadge'
import StatusBadge from '@/app/components/shared/StatusBadge'
import LoadingSpinner from '@/app/components/shared/LoadingSpinner'
import CaseFilters, { FilterState } from '@/app/components/cases/CaseFilters'
import { MapPin, Calendar, AlertCircle, Map, List } from 'lucide-react'
import { CASE_TYPE_LABELS, SPECIES_LABELS } from '@/app/lib/constants'
import { getTimeAgo } from '@/app/lib/utils/format'
import dynamic from 'next/dynamic'

const CasesMap = dynamic(() => import('@/app/components/maps/CasesMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-border rounded-xl flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  ),
})

export default function CasosPage() {
  const router = useRouter()
  const [cases, setCases] = useState<any[]>([])
  const [filteredCases, setFilteredCases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>({})
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const { getCases } = await import('@/app/actions/cases')
        const result = await getCases({ limit: 50 })

        if (result.error) {
          setError(result.error)
        } else {
          setCases(result.cases || [])
          setFilteredCases(result.cases || [])
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCases()
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = [...cases]

    if (filters.case_type) {
      filtered = filtered.filter(c => c.case_type === filters.case_type)
    }
    if (filters.species) {
      filtered = filtered.filter(c => c.species === filters.species)
    }
    if (filters.urgency) {
      filtered = filtered.filter(c => c.urgency === filters.urgency)
    }
    if (filters.status) {
      filtered = filtered.filter(c => c.status === filters.status)
    }

    setFilteredCases(filtered)
  }, [filters, cases])

  const handleMarkerClick = (caseId: string) => {
    router.push(`/casos/${caseId}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Casos de Rescate</h1>
            <p className="text-muted mt-2">Encuentra animales que necesitan ayuda cerca de ti</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/reportar"
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-light transition-colors"
            >
              <AlertCircle className="w-5 h-5" />
              Reportar Caso
            </Link>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-primary text-white'
                : 'bg-card-bg border border-border hover:border-primary'
            }`}
          >
            <List className="w-5 h-5" />
            Lista
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'map'
                ? 'bg-primary text-white'
                : 'bg-card-bg border border-border hover:border-primary'
            }`}
          >
            <Map className="w-5 h-5" />
            Mapa
          </button>
          <div className="ml-auto text-sm text-muted">
            {filteredCases.length} {filteredCases.length === 1 ? 'caso' : 'casos'} encontrados
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <CaseFilters onFilterChange={setFilters} activeFilters={filters} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {loading && (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            )}

            {error && (
              <div className="p-6 bg-danger/10 border border-danger/20 rounded-lg">
                <p className="text-danger">{error}</p>
              </div>
            )}

            {!loading && !error && cases.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted text-lg">No hay casos reportados aún</p>
                <Link
                  href="/reportar"
                  className="inline-block mt-4 text-primary font-semibold hover:underline"
                >
                  Sé el primero en reportar un caso
                </Link>
              </div>
            )}

            {!loading && !error && filteredCases.length === 0 && cases.length > 0 && (
              <div className="text-center py-12">
                <p className="text-muted text-lg">No se encontraron casos con estos filtros</p>
                <button
                  onClick={() => setFilters({})}
                  className="inline-block mt-4 text-primary font-semibold hover:underline"
                >
                  Limpiar filtros
                </button>
              </div>
            )}

            {/* Map View */}
            {!loading && !error && viewMode === 'map' && filteredCases.length > 0 && (
              <CasesMap
                cases={filteredCases.map(c => ({
                  id: c.id,
                  lat: c.public_lat,
                  lng: c.public_lng,
                  title: c.title,
                  urgency: c.urgency,
                  case_type: c.case_type,
                  species: c.species,
                }))}
                onMarkerClick={handleMarkerClick}
              />
            )}

            {/* List View */}
            {!loading && !error && viewMode === 'list' && filteredCases.length > 0 && (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredCases.map((caso) => (
              <Link
                key={caso.id}
                href={`/casos/${caso.id}`}
                className="bg-card-bg border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Image */}
                {caso.case_photos && caso.case_photos.length > 0 ? (
                  <img
                    src={caso.case_photos[0].storage_url}
                    alt={caso.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-border flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-muted" />
                  </div>
                )}

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground line-clamp-2 flex-1">
                      {caso.title}
                    </h3>
                    <UrgencyBadge urgency={caso.urgency} />
                  </div>

                  <p className="text-sm text-muted line-clamp-2">{caso.description}</p>

                  <div className="flex items-center gap-2 text-sm text-muted">
                    <span className="font-medium">{CASE_TYPE_LABELS[caso.case_type as keyof typeof CASE_TYPE_LABELS]}</span>
                    <span>•</span>
                    <span>{SPECIES_LABELS[caso.species as keyof typeof SPECIES_LABELS]}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <Calendar className="w-4 h-4" />
                      <span>{getTimeAgo(caso.created_at)}</span>
                    </div>
                    <StatusBadge status={caso.status} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  )
}
