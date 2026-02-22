'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase/client'
import Header from '@/app/components/layout/Header'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import LoadingSpinner from '@/app/components/shared/LoadingSpinner'

export default function TestDBPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [details, setDetails] = useState<any>(null)

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test 1: Verificar conexión básica
        const { data, error } = await supabase.from('profiles').select('count')
        
        if (error) {
          setStatus('error')
          setMessage(`Error de conexión: ${error.message}`)
          setDetails(error)
          return
        }

        // Test 2: Verificar autenticación
        const { data: { session } } = await supabase.auth.getSession()
        
        setStatus('success')
        setMessage('Conexión exitosa con Supabase')
        setDetails({
          profilesTable: 'Accesible',
          authenticated: session ? 'Sí' : 'No',
          user: session?.user?.email || 'No autenticado',
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        })
      } catch (err: any) {
        setStatus('error')
        setMessage(`Error inesperado: ${err.message}`)
        setDetails(err)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Prueba de Conexión con Supabase</h1>
        
        <div className="bg-card-bg p-8 rounded-xl border border-border shadow-sm">
          {status === 'loading' && (
            <div className="flex items-center gap-4">
              <LoadingSpinner size="md" />
              <p className="text-lg">Probando conexión...</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-success">
                <CheckCircle className="w-8 h-8" />
                <p className="text-xl font-semibold">{message}</p>
              </div>
              
              <div className="mt-6 bg-background p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Detalles de la conexión:</h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(details, null, 2)}
                </pre>
              </div>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-danger">
                <XCircle className="w-8 h-8" />
                <p className="text-xl font-semibold">{message}</p>
              </div>
              
              <div className="mt-6 bg-danger/10 p-4 rounded-lg border border-danger/20">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Detalles del error:
                </h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(details, null, 2)}
                </pre>
              </div>
              
              <div className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <h3 className="font-semibold mb-2">Posibles soluciones:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Verifica que las variables de entorno estén configuradas correctamente en .env.local</li>
                  <li>Asegúrate de haber ejecutado el SQL schema en Supabase</li>
                  <li>Verifica que las políticas RLS estén configuradas</li>
                  <li>Revisa que el proyecto de Supabase esté activo</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
