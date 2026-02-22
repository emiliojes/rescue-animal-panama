import Link from 'next/link'
import { Heart, MapPin, AlertCircle } from 'lucide-react'
import Header from '@/app/components/layout/Header'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Ayuda a Salvar Vidas Animales
            </h2>
            <p className="text-xl text-muted mb-8">
              Reporta casos de rescate, maltrato o animales perdidos. 
              Conecta con rescatistas verificados en toda Panamá.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/reportar"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary-light transition-colors shadow-lg"
              >
                <AlertCircle className="w-5 h-5" />
                Reportar Caso
              </Link>
              <Link
                href="/casos"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary border-2 border-primary rounded-lg font-semibold hover:bg-primary/5 transition-colors"
              >
                <MapPin className="w-5 h-5" />
                Ver Mapa de Casos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card-bg p-6 rounded-xl border border-border shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Reporta Rápido</h3>
              <p className="text-muted">
                Crea un reporte en menos de 3 minutos con fotos, ubicación y descripción del caso.
              </p>
            </div>

            <div className="bg-card-bg p-6 rounded-xl border border-border shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Rescatistas Verificados</h3>
              <p className="text-muted">
                Conecta con rescatistas y ONGs verificadas que pueden ayudar en tu área.
              </p>
            </div>

            <div className="bg-card-bg p-6 rounded-xl border border-border shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Privacidad Protegida</h3>
              <p className="text-muted">
                Tu ubicación exacta solo es visible para rescatistas verificados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Eres rescatista o parte de una ONG?</h2>
          <p className="text-lg text-muted mb-6">
            Regístrate para acceder a casos cerca de ti y ayudar a más animales.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-light transition-colors"
          >
            Registrarse como Rescatista
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card-bg border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-muted">
            <p>&copy; 2026 Rescate Animal Panamá. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
