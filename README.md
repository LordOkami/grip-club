# Grip Club - Sistema de Inscripciones

Web de inscripciones para el evento de resistencia de motos Grip Club.

## Stack Tecnologico

- **Frontend**: Astro 5.x con SSR
- **Estilos**: Tailwind CSS
- **Auth**: Netlify Identity
- **Base de datos**: Supabase (PostgreSQL)
- **Hosting**: Netlify
- **Serverless**: Netlify Functions

---

## Panel de Administracion

### Acceso al Panel

El panel de administracion esta disponible en:

```
https://your-site.netlify.app/panel
```

### Crear Usuarios Admin

Los administradores se definen mediante la variable de entorno `ADMIN_EMAILS`.

#### 1. Crear cuenta de usuario

Primero, el usuario debe tener una cuenta en el sitio:

1. Ir a https://your-site.netlify.app/auth/signup
2. Registrarse con el email que sera admin
3. Confirmar el email recibido

#### 2. Anadir email a la lista de admins

**En el archivo `.env` local:**

```env
ADMIN_EMAILS=email1@ejemplo.com,email2@ejemplo.com
```

**En Netlify (produccion):**

1. Ir a https://app.netlify.com/projects/grip-club/configuration/env
2. Anadir o editar la variable `ADMIN_EMAILS`
3. Valor: lista de emails separados por comas (sin espacios)
4. Guardar y hacer redeploy

**Ejemplo:**
```
ADMIN_EMAILS=luissebastianhuerta@gmail.com,g.sanjose.g@gmail.com
```

#### 3. Acceder al panel

1. Iniciar sesion en https://your-site.netlify.app/auth/login con el email admin
2. Ir a https://your-site.netlify.app/panel
3. Si el email esta en `ADMIN_EMAILS`, se mostrara el panel de administracion

### Funcionalidades del Panel

| Seccion | URL | Descripcion |
|---------|-----|-------------|
| **Dashboard** | `/panel` | Estadisticas generales (equipos totales, pendientes, confirmados, pilotos) |
| **Equipos** | `/panel/equipos` | Lista de equipos con filtros por estado, busqueda, cambiar estado |
| **Detalle Equipo** | `/panel/equipos/[id]` | Informacion completa: representante, moto, pilotos, staff |
| **Configuracion** | `/panel/configuracion` | Abrir/cerrar inscripciones, fechas limite, ubicacion evento |
| **Exportar** | `/panel/exportar` | Descargar datos en CSV (equipos, pilotos, staff) o JSON completo |

### Estados de Equipo

| Estado | Color | Descripcion |
|--------|-------|-------------|
| `draft` | Gris | Borrador - equipo incompleto (menos de 4 pilotos) |
| `pending` | Amarillo | Pendiente - esperando revision/confirmacion |
| `confirmed` | Verde | Confirmado - inscripcion aceptada |
| `cancelled` | Rojo | Cancelado |

---

## Desarrollo Local

### Requisitos

- Node.js 18+
- npm o pnpm
- Cuenta en Supabase
- Cuenta en Netlify

### Instalacion

```bash
# Clonar repositorio
git clone <repo-url>
cd grip-group

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase
```

### Variables de Entorno

```env
# Supabase - obtener de https://app.supabase.com -> Project Settings -> API
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# URL del sitio
PUBLIC_SITE_URL=https://your-site.netlify.app

# Emails de administradores (separados por comas, sin espacios)
ADMIN_EMAILS=admin@ejemplo.com,otro@ejemplo.com
```

### Comandos

```bash
# Desarrollo local
npm run dev

# Build de produccion
npm run build

# Preview del build
npm run preview

# Desarrollo con Netlify Functions
netlify dev
```

---

## Estructura del Proyecto

```
grip-group/
├── src/
│   ├── pages/
│   │   ├── index.astro          # Home
│   │   ├── inscripciones.astro  # Info inscripciones
│   │   ├── motos.astro          # Reglamento tecnico
│   │   ├── auth/                # Login/Signup
│   │   │   ├── login.astro
│   │   │   └── signup.astro
│   │   ├── dashboard/           # Panel usuario
│   │   │   ├── index.astro
│   │   │   ├── equipo.astro
│   │   │   ├── pilotos.astro
│   │   │   ├── staff.astro
│   │   │   └── moto.astro
│   │   └── panel/               # Panel admin
│   │       ├── index.astro
│   │       ├── equipos.astro
│   │       ├── equipos/[id].astro
│   │       ├── configuracion.astro
│   │       └── exportar.astro
│   ├── layouts/
│   │   ├── Layout.astro
│   │   ├── DashboardLayout.astro
│   │   └── AdminLayout.astro
│   ├── lib/
│   │   └── identity.ts          # Netlify Identity wrapper
│   └── i18n/
│       └── utils.ts             # Traducciones ES/EN
├── netlify/
│   └── functions/
│       ├── api-teams.ts         # CRUD equipos (usuario)
│       ├── api-pilots.ts        # CRUD pilotos
│       ├── api-staff.ts         # CRUD staff
│       ├── admin-teams.ts       # Admin: listar/editar equipos
│       ├── admin-export.ts      # Admin: exportar CSV/JSON
│       ├── admin-settings.ts    # Admin: configuracion
│       └── utils/
│           ├── supabase.ts      # Cliente Supabase
│           └── auth.ts          # Validacion JWT + isAdmin()
├── public/
│   └── admin/                   # Decap CMS (gestion contenido)
├── .env                         # Variables locales (no commitear)
└── .env.example                 # Plantilla de variables
```

---

## Base de Datos (Supabase)

### Tablas Principales

| Tabla | Descripcion |
|-------|-------------|
| `teams` | Equipos registrados (nombre, representante, moto, estado) |
| `pilots` | Pilotos de cada equipo (max 8 por equipo) |
| `team_staff` | Staff de cada equipo (max 4 por equipo) |
| `registration_settings` | Configuracion de inscripciones |

### Crear Tablas

Ejecutar en Supabase SQL Editor:

```sql
-- Equipos
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  representative_user_id TEXT UNIQUE NOT NULL,
  name VARCHAR(100),
  number_of_pilots INTEGER DEFAULT 4 CHECK (number_of_pilots >= 4 AND number_of_pilots <= 8),
  representative_name VARCHAR(100),
  representative_surname VARCHAR(100),
  representative_dni VARCHAR(20),
  representative_phone VARCHAR(20),
  representative_email VARCHAR(255),
  address TEXT,
  municipality VARCHAR(100),
  postal_code VARCHAR(10),
  province VARCHAR(100),
  motorcycle_brand VARCHAR(100),
  motorcycle_model VARCHAR(100),
  engine_capacity VARCHAR(20),
  registration_date DATE,
  modifications TEXT,
  comments TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  gdpr_consent BOOLEAN DEFAULT false,
  gdpr_consent_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pilotos
CREATE TABLE pilots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name VARCHAR(100),
  surname VARCHAR(100),
  dni VARCHAR(20),
  email VARCHAR(255),
  phone VARCHAR(20),
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(20),
  driving_level VARCHAR(20),
  track_experience TEXT,
  is_representative BOOLEAN DEFAULT false,
  pilot_number INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff
CREATE TABLE team_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name VARCHAR(200),
  dni VARCHAR(20),
  phone VARCHAR(20),
  role VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configuracion
CREATE TABLE registration_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_open BOOLEAN DEFAULT true,
  max_teams INTEGER DEFAULT 35,
  registration_deadline TIMESTAMPTZ,
  pilot_modification_deadline TIMESTAMPTZ,
  event_date DATE,
  event_location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar configuracion por defecto
INSERT INTO registration_settings (registration_open, max_teams) VALUES (true, 35);
```

---

## Deploy a Produccion

### Netlify

```bash
# Deploy a produccion
netlify deploy --prod

# Deploy preview (para testing)
netlify deploy
```

### Variables en Netlify Dashboard

Configurar en **Site Settings > Environment Variables**:

| Variable | Descripcion |
|----------|-------------|
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_ANON_KEY` | Clave publica (anon) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (secreta) |
| `PUBLIC_SITE_URL` | URL del sitio en Netlify |
| `ADMIN_EMAILS` | Emails de admins separados por comas |

---

## Soporte

Para problemas o sugerencias, contactar al equipo de desarrollo.
