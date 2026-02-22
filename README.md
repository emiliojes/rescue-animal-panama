# 🐾 Rescate Animal Panamá

Plataforma web para reportar casos de rescate animal, denuncias de maltrato y conectar con rescatistas verificados en Panamá.

## 📋 Descripción

Esta aplicación permite a cualquier persona reportar casos de animales que necesitan ayuda, mientras protege la privacidad de los reportantes mediante ubicaciones aproximadas. Los rescatistas verificados pueden ver los detalles completos y tomar casos para ayudar.

## 🚀 Stack Tecnológico

- **Frontend:** Next.js 16 (App Router) + TypeScript + React 19
- **Backend:** Supabase (Auth, Postgres, Storage, Realtime)
- **Styling:** Tailwind CSS 4
- **Validación:** Zod
- **Mapas:** React Leaflet
- **Formularios:** React Hook Form
- **Iconos:** Lucide React
- **Notificaciones:** React Hot Toast

## 🛠️ Instalación

### Prerrequisitos

- Node.js 20+
- npm o yarn
- Cuenta de Supabase

### Pasos

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd rescate-animal-panama
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key

# Opcional: Mapbox para mapas avanzados
NEXT_PUBLIC_MAPBOX_TOKEN=tu_mapbox_token
```

4. **Configurar Supabase**

- Crea un proyecto en [Supabase](https://supabase.com)
- Ejecuta el SQL en `supabase/migrations/001_initial_schema.sql` en el SQL Editor de Supabase
- Crea el storage bucket `case-photos` con acceso público

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
rescate-animal-panama/
├── app/
│   ├── actions/              # Server Actions
│   ├── components/
│   │   ├── cases/           # Componentes de casos
│   │   ├── forms/           # Formularios
│   │   ├── layout/          # Layout components
│   │   ├── shared/          # Componentes compartidos
│   │   └── ui/              # UI components
│   ├── lib/
│   │   ├── supabase/        # Clientes de Supabase
│   │   ├── validations/     # Schemas de Zod
│   │   └── utils/           # Utilidades
│   ├── types/               # Tipos TypeScript
│   ├── globals.css          # Estilos globales
│   ├── layout.tsx           # Layout principal
│   └── page.tsx             # Página home
├── supabase/
│   └── migrations/          # Migraciones SQL
└── public/                  # Archivos estáticos
```

## 🗄️ Base de Datos

### Tablas Principales

- **profiles** - Perfiles de usuarios
- **cases** - Casos de rescate/denuncia
- **case_photos** - Fotos de casos
- **case_updates** - Actualizaciones de estado
- **case_claims** - Claims de rescatistas
- **comments** - Comentarios en casos
- **flags** - Reportes de contenido

### Seguridad (RLS)

Todas las tablas tienen Row Level Security habilitado:
- Ubicaciones exactas solo visibles para rescatistas verificados
- Datos de contacto protegidos
- Sistema de roles (public, registered, rescuer, admin)

## 🔐 Roles de Usuario

1. **Público/Anónimo** - Puede crear reportes y ver casos públicos
2. **Registrado** - Puede comentar y seguir casos
3. **Rescatista Verificado** - Puede ver datos sensibles y tomar casos
4. **Admin** - Moderación y verificación de rescatistas

## 🎨 Características

### MVP (Fase 1-4)
- ✅ Estructura base del proyecto
- ✅ Configuración de Supabase
- ✅ Página principal con diseño
- ✅ Sistema de tipos y validaciones
- ⏳ Sistema de autenticación
- ⏳ Wizard de reportes (3 pasos)
- ⏳ Feed de casos con filtros
- ⏳ Mapa interactivo

### Próximas Fases
- Sistema de claims para rescatistas
- Panel de rescatista
- Sistema de comentarios
- Moderación y admin
- Notificaciones

## 🚀 Scripts Disponibles

```bash
npm run dev      # Desarrollo
npm run build    # Build para producción
npm run start    # Servidor de producción
npm run lint     # Linter
```

## 🔒 Privacidad y Seguridad

- **Ubicación aproximada:** Las coordenadas públicas se aproximan en ~400m
- **Datos sensibles:** Solo rescatistas verificados ven contacto y ubicación exacta
- **RLS:** Todas las queries están protegidas a nivel de base de datos
- **Validación:** Zod valida datos en cliente y servidor

## 📝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🤝 Contacto

Para preguntas o sugerencias, por favor abre un issue en GitHub.

---

**Hecho con ❤️ para ayudar a los animales de Panamá**
