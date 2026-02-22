'use client'

import Link from 'next/link'
import { useAuthContext } from '@/app/components/auth/AuthProvider'
import NotificationBell from '@/app/components/notifications/NotificationBell'
import { PawPrint, User, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import LoadingSpinner from '@/app/components/shared/LoadingSpinner'

export default function Header() {
  const { user, profile, loading, signOut } = useAuthContext()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-card-bg border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <PawPrint className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary hidden sm:block">
              Rescate Animal Panamá
            </h1>
            <h1 className="text-xl font-bold text-primary sm:hidden">
              RAP
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/casos" className="text-foreground hover:text-primary transition-colors">
              Ver Casos
            </Link>
            
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : user ? (
              <>
                <Link href="/reportar" className="text-foreground hover:text-primary transition-colors">
                  Reportar Caso
                </Link>
                <Link href="/mis-casos" className="text-foreground hover:text-primary transition-colors">
                  Mis Casos
                </Link>
                <div className="flex items-center gap-4">
                  <NotificationBell />
                  <Link 
                    href="/perfil" 
                    className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span>{profile?.name || 'Mi Perfil'}</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-muted hover:text-danger transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Salir</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-light transition-colors"
                >
                  Registrarse
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <Link 
                href="/casos" 
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Ver Casos
              </Link>
              
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : user ? (
                <>
                  <Link 
                    href="/reportar" 
                    className="text-foreground hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Reportar Caso
                  </Link>
                  <Link 
                    href="/mis-casos" 
                    className="text-foreground hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mis Casos
                  </Link>
                  <Link 
                    href="/perfil" 
                    className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    <span>{profile?.name || 'Mi Perfil'}</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-muted hover:text-danger transition-colors text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Salir</span>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="text-foreground hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-light transition-colors text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
