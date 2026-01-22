# GRIP Club - Arquitectura de Diseño Web

## Objetivo Principal
GRIP Club no es una web informativa. Es la puerta de entrada a una experiencia de motos basada en desafío, resistencia, equipo y comunidad. El objetivo es **atraer, retener y convertir** visitantes en participantes.

## Principios de Diseño

### 1. Jerarquía Clara
- **Inscripciones** y **Acceso a Mi equipo** destacan visualmente
- Navegación estructurada por propósito, no por contenido
- CTAs siempre visibles y diferenciados

### 2. Primero Emoción, Luego Detalle
- Impacto visual antes que texto
- Contenido multimedia prioritario
- Información técnica accesible pero no invasiva

### 3. Mobile-First Real
- Diseño optimizado para móvil
- Información comprensible en segundos
- Interacciones táctiles fluidas

## Arquitectura de Navegación

### Navegación Principal
```
┌─────────────────────────────────────────────────────┐
│  [LOGO]  Home | Calendario | Motos | Reglamentos   │
│         Inscripciones | Tienda    [Acceso Mi Equipo]│
└─────────────────────────────────────────────────────┘
```

**Jerarquía Visual:**
1. **Primario (destacado):** Inscripciones, Acceso a Mi Equipo
2. **Secundario:** Home, Calendario, Motos
3. **Terciario:** Reglamentos, Tienda

### Recorrido del Usuario

```
Home (inspira)
    ↓
Calendario (conecta con la realidad)
    ↓
Motos (elimina dudas)
    ↓
Reglamentos (da seguridad)
    ↓
Inscripciones (convierte)
    ↓
Tienda (refuerza pertenencia)
    ↓
Acceso a Mi equipo (continuidad y compromiso)
```

## Páginas - Especificaciones

### 1. HOME - El Tráiler

**Objetivo:** Emocionar y provocar curiosidad

**Estructura:**
```
┌─────────────────────────────────────────┐
│  HERO: Próximo Evento destacado         │
│  - Logo Desafío Bronce (dinámico)       │
│  - Fecha y lugar prominentes            │
│  - CTA: "Inscríbete ahora"              │
├─────────────────────────────────────────┤
│  ¿Qué es GRIP Club?                     │
│  "Resistencia amateur 125cc por equipos"│
├─────────────────────────────────────────┤
│  Carrusel de Categorías                 │
│  Bronce | Acero | Plata | Oro | Platino │
├─────────────────────────────────────────┤
│  Pilares Visuales:                      │
│  - 125cc de serie                       │
│  - Resistencia por equipos              │
│  - Espíritu amateur                     │
├─────────────────────────────────────────┤
│  CTA Final: "Únete al desafío"          │
└─────────────────────────────────────────┘
```

**Elementos clave:**
- Logo evento interactivo (rotación 3D, hover effects)
- Video o galería de momentos épicos
- Contador hasta el próximo evento
- Stats impactantes (equipos, pilotos, horas de resistencia)

### 2. HISTORIA - Origen e Identidad

**Objetivo:** Construir identidad emocional

**Estructura:**
```
┌─────────────────────────────────────────┐
│  Título: "De amigos a comunidad"        │
│  Narrativa del origen                   │
├─────────────────────────────────────────┤
│  Los Tres Pilares (cards interactivas)  │
│  ┌───────────┬───────────┬───────────┐ │
│  │ 125cc     │ Resistencia│ Amateur   │ │
│  │ Serie     │ Por Equipos│ Comunidad │ │
│  └───────────┴───────────┴───────────┘ │
├─────────────────────────────────────────┤
│  Timeline: Evolución del proyecto       │
│  Galería de momentos históricos         │
└─────────────────────────────────────────┘
```

**Elementos visuales:**
- Fotografías de paddock, momentos de equipo
- Iconografía personalizada para cada pilar
- Transiciones suaves entre secciones

### 3. CALENDARIO - La Realidad del Proyecto

**Objetivo:** Mostrar que GRIP Club está vivo

**Estructura:**
```
┌─────────────────────────────────────────┐
│  PRÓXIMO EVENTO (destacado)             │
│  ┌─────────────────────────────────┐   │
│  │ Desafío Bronce 8 Horas          │   │
│  │ Logo evento | Fecha | Circuito  │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  Programa del Fin de Semana             │
│  Viernes:   Acreditaciones/Verificaciones│
│  Sábado:    Warm up / Clasificación     │
│  Domingo:   Resistencia / Celebración   │
├─────────────────────────────────────────┤
│  Carrusel de Eventos                    │
│  ← [Pasados] [Presente] [Futuros] →    │
│  Acero | Bronce | Plata | Oro | Platino│
└─────────────────────────────────────────┘
```

**Características:**
- Carrusel interactivo con filtros por categoría
- Timeline visual del programa
- Galería de eventos pasados con resultados
- Integración de Google Calendar / iCal

### 4. MOTOS - La Puerta de Entrada

**Objetivo:** Aspiracional y tranquilizador

**Estructura:**
```
┌─────────────────────────────────────────┐
│  "Tu moto puede ser la próxima"         │
│  Galería visual de motos elegibles      │
│  ┌────┬────┬────┬────┬────┬────┐       │
│  │    │    │    │    │    │    │       │
│  └────┴────┴────┴────┴────┴────┘       │
├─────────────────────────────────────────┤
│  Requisitos Simples:                    │
│  ✓ 125cc 4T de serie                   │
│  ✓ Sin modificaciones estructurales     │
│  ✓ Revisión técnica básica              │
├─────────────────────────────────────────┤
│  CTA: "Ver reglamento técnico completo" │
└─────────────────────────────────────────┘
```

**Elementos visuales:**
- Grid de motos con hover effects
- Iconos de verificación clara
- Enlace directo al reglamento técnico

### 5. REGLAMENTOS - Confianza y Seriedad

**Objetivo:** Transmitir organización y profesionalidad

**Estructura:**
```
┌─────────────────────────────────────────┐
│  Tres Pilares Normativos                │
│  ┌──────────┬──────────┬──────────┐    │
│  │Reglamento│Reglamento│ Normativa│    │
│  │ Técnico  │Deportivo │Seguridad │    │
│  │   📄     │   📄     │   📄     │    │
│  └──────────┴──────────┴──────────┘    │
├─────────────────────────────────────────┤
│  Secciones Expandibles                  │
│  - Especificaciones técnicas            │
│  - Formato de carrera                   │
│  - Protección obligatoria               │
│  - Procedimientos de seguridad          │
└─────────────────────────────────────────┘
```

**Diseño:**
- Acordeones o tabs para organizar información
- Documentos descargables en PDF
- Resaltado de puntos clave

### 6. INSCRIPCIONES - Punto de Conversión

**Objetivo:** Convertir interés en acción

**Estructura:**
```
┌─────────────────────────────────────────┐
│  "Únete al Desafío Bronce 8 Horas"      │
│  Fecha límite: XX días restantes        │
├─────────────────────────────────────────┤
│  ¿Cómo Participar?                      │
│  1️⃣ Forma tu equipo (4-8 pilotos)      │
│  2️⃣ Prepara tu moto 125cc              │
│  3️⃣ Completa la inscripción            │
├─────────────────────────────────────────┤
│  Precio e Inclusiones                   │
│  - Participación completa               │
│  - Box asignado                         │
│  - Acreditaciones                       │
│  - Cronometraje profesional             │
├─────────────────────────────────────────┤
│  CTA Principal: "Inscribir mi equipo"   │
│  CTA Secundario: "Solicitar info"       │
└─────────────────────────────────────────┘
```

**Elementos de conversión:**
- Contador regresivo de plazas disponibles
- Testimonios de equipos participantes
- FAQ integrado
- Chat o formulario de contacto directo

### 7. TIENDA - Refuerza Pertenencia

**Objetivo:** Crear sentido de comunidad

**Estructura:**
```
┌─────────────────────────────────────────┐
│  "Viste los colores de tu pasión"       │
│  Merchandising Oficial GRIP Club        │
├─────────────────────────────────────────┤
│  Categorías                             │
│  [Camisetas] [Gorras] [Accesorios]      │
├─────────────────────────────────────────┤
│  Grid de Productos                      │
│  ┌────┬────┬────┬────┐                 │
│  │    │    │    │    │                 │
│  └────┴────┴────┴────┘                 │
└─────────────────────────────────────────┘
```

### 8. ACCESO A MI EQUIPO - Continuidad

**Objetivo:** Gestión de inscripción y seguimiento

**Estructura:**
```
┌─────────────────────────────────────────┐
│  Dashboard del Equipo                   │
│  Estado: [Borrador/Pendiente/Confirmado]│
├─────────────────────────────────────────┤
│  Progreso de Inscripción                │
│  ▓▓▓▓▓▓▓░░░ 70%                        │
├─────────────────────────────────────────┤
│  Secciones:                             │
│  - Información del equipo               │
│  - Pilotos registrados (4/8)            │
│  - Staff del equipo                     │
│  - Información de la moto               │
│  - Documentación pendiente              │
├─────────────────────────────────────────┤
│  Próximos Pasos                         │
│  ✓ Equipo creado                        │
│  ⏳ Añadir más pilotos                  │
│  ⏳ Subir foto de la moto               │
└─────────────────────────────────────────┘
```

## Sistema de Diseño

### Paleta de Colores
```
Racing Green (primario):  #004225
Vanilla (secundario):     #f5f1e7
Racing Black (fondo):     #0A0A0A
Racing Gray:              #1a1a1a
Racing Silver (texto):    #A1A1AA
```

### Tipografía
- **Headings:** Bebas Neue (impacto, deportivo)
- **Body:** Inter (legibilidad, moderno)

### Componentes Clave

**Botones:**
```css
.btn-primary {
  background: Racing Green
  color: Vanilla
  bold, uppercase
  hover: scale + shadow
}

.btn-secondary {
  border: Vanilla
  color: Vanilla
  hover: fill Vanilla, text Racing Green
}
```

**Cards:**
```css
.card {
  background: Racing Gray
  border: Racing Silver/20
  rounded-2xl
  hover: border Racing Green
}
```

## Responsividad

### Breakpoints
- **Mobile:** < 768px (diseño base)
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

### Mobile-First Approach
1. Contenido esencial visible sin scroll
2. Navegación hamburger optimizada
3. CTAs siempre accesibles
4. Imágenes optimizadas para carga rápida
5. Touch targets mínimo 44x44px

## Interactividad

### Animaciones
- Scroll reveal progresivo
- Hover effects sutiles
- Transiciones suaves (300ms)
- Parallax en hero sections

### Microinteracciones
- Botones con feedback visual
- Loading states
- Success/error states
- Progress indicators

## Entregables

1. ✅ **Arquitectura de información** (este documento)
2. 🔄 **Wireframes mobile y desktop** (implementado en código)
3. 🔄 **Identidad visual** (sistema de diseño implementado)
4. 🔄 **Prototipo navegable** (web funcional)

## Próximos Pasos

1. Implementar rediseño de navegación con jerarquía clara
2. Optimizar Home como "El Tráiler"
3. Crear página Historia con tres pilares
4. Implementar Calendario con carrusel
5. Optimizar resto de páginas según especificaciones
