# Task Timer

Aplicación web para gestionar tareas con cronómetro en tiempo real. Permite crear tareas, iniciar y detener su contador, y consultar el historial de tareas eliminadas y completadas. Todo persiste en MongoDB.

---

## Tabla de contenidos

1. [Vista general](#1-vista-general)
2. [Stack tecnológico](#2-stack-tecnológico)
3. [Estructura del proyecto](#3-estructura-del-proyecto)
4. [Base de datos — MongoDB](#4-base-de-datos--mongodb)
5. [API REST — Rutas HTTP](#5-api-rest--rutas-http)
6. [Lógica del servidor](#6-lógica-del-servidor)
7. [Componentes React](#7-componentes-react)
8. [Hooks de React utilizados](#8-hooks-de-react-utilizados)
9. [HeroUI — por qué y cómo se usa](#9-heroui--por-qué-y-cómo-se-usa)
10. [Sistema de estilos](#10-sistema-de-estilos)
11. [Tipos TypeScript](#11-tipos-typescript)
12. [Variables de entorno](#12-variables-de-entorno)
13. [Cómo correr el proyecto](#13-cómo-correr-el-proyecto)

---

## 1. Vista general

Task Timer es una SPA (Single Page Application) construida con **Next.js 16 (App Router)**. El flujo principal es:

```
Usuario escribe tarea → se guarda en MongoDB → aparece como card
Usuario inicia tarea  → el cronómetro corre en el cliente (cada segundo)
Usuario finaliza      → el tiempo se guarda en DB → card se auto-archiva en 10s
Usuario elimina       → la tarea va al historial inmediatamente
```

El cronómetro **no depende del servidor** para contar: el cliente calcula el tiempo transcurrido a partir del `startedAt` guardado en la base de datos, por lo que **sobrevive recargas de página** sin perder tiempo.

---

## 2. Stack tecnológico

| Tecnología | Versión | Por qué se eligió |
|---|---|---|
| **Next.js** | 16.2.6 | App Router, rutas API integradas, SSR/SSG, soporte React Server Components |
| **React** | 19.2.4 | Última versión estable, soporte completo de hooks concurrentes |
| **TypeScript** | 5 | Tipado estático, previene errores en tiempo de desarrollo |
| **Tailwind CSS** | 4 | Estilos utilitarios directamente en JSX, sin archivos CSS separados por componente |
| **HeroUI** | 3.1.0 | Librería de componentes UI compatible con React 19 y Tailwind CSS v4 |
| **lucide-react** | 1.17.0 | Iconos SVG modernos, tree-shakeable, integración natural con HeroUI |
| **Mongoose** | 9.6.2 | ODM para MongoDB, define esquemas y modelos con validación |
| **MongoDB Atlas** | — | Base de datos NoSQL en la nube, esquema flexible ideal para tareas |

---

## 3. Estructura del proyecto

```
task-time/
├── app/                          # App Router de Next.js
│   ├── api/                      # Rutas del servidor (API REST)
│   │   ├── health/
│   │   │   └── route.ts          # GET  /api/health — verifica conexión a DB
│   │   ├── history/
│   │   │   └── route.ts          # GET  /api/history — trae el historial
│   │   └── tasks/
│   │       ├── route.ts          # GET  /api/tasks  — lista tareas activas
│   │       │                     # POST /api/tasks  — crea nueva tarea
│   │       └── [id]/
│   │           └── route.ts      # PATCH  /api/tasks/:id — cambia estado
│   │                             # DELETE /api/tasks/:id — elimina y archiva
│   ├── globals.css               # Estilos globales + animaciones CSS + HeroUI styles
│   ├── layout.tsx                # Layout raíz: fuentes, fondo, metadata
│   └── page.tsx                  # Página principal — toda la lógica del cliente
│
├── components/
│   └── Card.tsx                  # Componente de tarjeta (3 variantes visuales)
│
├── lib/
│   ├── db.ts                     # Singleton de conexión a MongoDB
│   ├── cleanup.ts                # Limpieza de tareas "done" expiradas
│   └── models/
│       ├── Task.ts               # Modelo Mongoose — colección "tasks"
│       └── History.ts            # Modelo Mongoose — colección "histories"
│
├── types/
│   └── task.ts                   # Tipos TypeScript compartidos cliente/servidor
│
├── .env.local                    # Variables de entorno (no se sube a git)
├── next.config.ts                # Configuración de Next.js
├── postcss.config.mjs            # Plugin de Tailwind CSS v4 para PostCSS
├── tsconfig.json                 # Configuración TypeScript con alias @/
└── package.json
```

---

## 4. Base de datos — MongoDB

### Por qué MongoDB

- Esquema **flexible**: las tareas tienen campos opcionales (`startedAt`, `doneAt`, `inProgressDuration`) que solo existen cuando son relevantes — en SQL requeriría columnas nullable con más overhead.
- **Sin migraciones**: agregar un campo nuevo no requiere alterar una tabla ni correr scripts.
- **MongoDB Atlas** ofrece capa gratuita (M0), ideal para proyectos con conexión desde cualquier lugar.
- Mongoose agrega tipado y validación encima del driver nativo de MongoDB.

### Conexión — `lib/db.ts`

Se usa el **patrón singleton con caché global**, estándar para Next.js con rutas de API serverless:

```ts
if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null }
}

export async function connectDB() {
  if (global.mongoose.conn) return global.mongoose.conn   // ya conectado
  if (!global.mongoose.promise) {
    global.mongoose.promise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      family: 4,
    })
  }
  global.mongoose.conn = await global.mongoose.promise
  return global.mongoose.conn
}
```

Sin este patrón, en modo desarrollo cada hot-reload abriría una conexión nueva y agotaría el pool de MongoDB rápidamente.

---

### Colección `tasks` — `lib/models/Task.ts`

Representa las tareas activas. Un documento se elimina cuando se archiva (manual o automáticamente).

```ts
{
  title: string            // texto de la tarea (requerido)
  status: 'pending'        // estado inicial al crear
         | 'inprogress'   // cuando el usuario presiona Iniciar
         | 'done'         // cuando el usuario presiona Finalizar
  startedAt: Date | null   // timestamp de inicio (para calcular duración)
  doneAt:    Date | null   // timestamp de finalización
  inProgressDuration: number | null  // segundos totales en progreso (calculado al hacer done)
  createdAt: Date          // automático (Mongoose timestamps: true)
  updatedAt: Date          // automático (Mongoose timestamps: true)
}
```

`inProgressDuration` se calcula en el **servidor** al hacer PATCH a `done`:
```ts
inProgressDuration = Math.floor((now.getTime() - task.startedAt.getTime()) / 1000)
```
Esto garantiza precisión independientemente del reloj del navegador.

---

### Colección `histories` — `lib/models/History.ts`

Archivo permanente. Los documentos nunca se eliminan automáticamente.

```ts
{
  title: string
  reason: 'deleted' | 'done'        // cómo terminó la tarea
  inProgressDuration: number | null  // cuánto tiempo estuvo activa (en segundos)
  archivedAt: Date                   // cuándo se archivó
  originalCreatedAt: Date            // cuándo se creó originalmente
}
```

---

## 5. API REST — Rutas HTTP

Todas las rutas viven en `app/api/` siguiendo las convenciones del App Router de Next.js. Cada `route.ts` exporta funciones nombradas por verbo HTTP.

---

### `GET /api/tasks`

Carga las tareas activas al iniciar la app.

**Proceso:**
1. Conecta a MongoDB
2. Ejecuta cleanup (archiva automáticamente las tareas `done` con más de 10s)
3. Retorna todas las tareas ordenadas por `createdAt` descendente

**Respuesta `200`:**
```json
[
  {
    "id": "64f3a...",
    "title": "Revisar diseño",
    "status": "inprogress",
    "startedAt": "2024-01-15T10:30:00.000Z",
    "doneAt": null,
    "inProgressDuration": null
  }
]
```

---

### `POST /api/tasks`

Crea una nueva tarea.

**Body:**
```json
{ "title": "Nombre de la tarea" }
```

**Validación:** si `title` está vacío devuelve `400 Bad Request`.

**Respuesta `201`:**
```json
{
  "id": "64f3b...",
  "title": "Nombre de la tarea",
  "status": "pending",
  "startedAt": null,
  "inProgressDuration": null
}
```

---

### `PATCH /api/tasks/:id`

Cambia el estado de una tarea (`pending → inprogress` o `inprogress → done`).

**Body:**
```json
{ "status": "inprogress" }
```

**Lógica por estado:**

| Nuevo estado | Qué hace el servidor |
|---|---|
| `inprogress` | Guarda `startedAt = new Date()` |
| `done` | Guarda `doneAt = new Date()` y calcula `inProgressDuration = (doneAt - startedAt) / 1000` |

**Respuesta `200`:** objeto tarea completo actualizado.
**Error `404`:** si el id no existe.

---

### `DELETE /api/tasks/:id`

Elimina una tarea y la archiva en el historial.

**Proceso:**
1. Busca la tarea
2. Crea documento en `histories` con `reason: 'deleted'`
3. Elimina la tarea de `tasks`

**Respuesta `200`:**
```json
{ "ok": true }
```

---

### `GET /api/history`

Trae el historial completo.

**Proceso:**
1. Ejecuta cleanup (por si quedaron tareas `done` sin archivar tras un reload)
2. Retorna todos los documentos de `histories` ordenados por `archivedAt` descendente

**Respuesta `200`:**
```json
[
  {
    "id": "64f3c...",
    "title": "Diseño revisado",
    "reason": "done",
    "inProgressDuration": 847,
    "archivedAt": "2024-01-15T10:44:07.000Z",
    "originalCreatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

### `GET /api/health`

Verifica que la conexión a MongoDB está activa. Útil para debugging.

**Respuesta `200`:**
```json
{ "status": "ok", "db": "connected" }
```

---

## 6. Lógica del servidor

### Cleanup automático — `lib/cleanup.ts`

Las tareas `done` desaparecen del cliente tras 10s (auto-archivado). Pero si el usuario recarga antes de que el cliente las elimine, siguen en la DB. `cleanupExpiredDoneTasks` se llama al inicio de `GET /api/tasks` y `GET /api/history`:

```ts
export async function cleanupExpiredDoneTasks() {
  const tenSecondsAgo = new Date(Date.now() - 10_000)

  const expired = await TaskModel.find({
    status: 'done',
    updatedAt: { $lte: tenSecondsAgo },   // usa updatedAt, no doneAt (más robusto en hot-reload)
  })

  if (expired.length === 0) return

  await HistoryModel.insertMany(
    expired.map(t => ({
      title: t.title,
      reason: 'done',
      inProgressDuration: t.inProgressDuration ?? null,
      archivedAt: new Date(),
      originalCreatedAt: t.createdAt,
    }))
  )

  await TaskModel.deleteMany({ _id: { $in: expired.map(t => t._id) } })
}
```

**Por qué `updatedAt` y no `doneAt`:** En hot-reload de desarrollo, Mongoose puede cachear el esquema sin `doneAt`. `updatedAt` es gestionado internamente por Mongoose y siempre está disponible.

---

## 7. Componentes React

### `app/page.tsx` — Página principal (`"use client"`)

Contiene toda la lógica de estado de la aplicación. Responsabilidades:

- Cargar tareas al montar
- Correr el ticker global cada 1s para actualizar cronómetros
- Manejar creación, inicio, finalización y eliminación de tareas
- Mostrar/ocultar el modal de historial
- Mostrar contadores de estado (pendientes, en progreso, completadas)

**Funciones clave:**

| Función | Descripción |
|---|---|
| `toLocal(t)` | Convierte tarea del servidor (fechas string) a formato cliente (timestamps numéricos, campos de timer) |
| `formatDuration(seconds)` | Convierte segundos a `MM:SS` o `H:MM:SS` para el historial |
| `handleCreate()` | POST a `/api/tasks`, agrega al estado local |
| `handleStart(id)` | PATCH a `inprogress`, registra `startTimestamp` en el estado |
| `handleFinish(id)` | PATCH a `done`, congela el timer, programa eliminación del estado en 10s |
| `handleDelete(id)` | DELETE, cancela el timer pendiente si existe, elimina del estado |
| `openHistory()` | GET a `/api/history`, abre el modal |

---

### `components/Card.tsx` — Tarjeta de tarea

Componente de presentación puro: recibe props y llama callbacks. Sin estado interno ni fetch.

Renderiza **3 variantes visuales** según `status`:

#### Variante `pending`
- Fondo blanco, borde gris suave, `rounded-3xl`
- Icono de reloj en círculo violeta claro
- Badge `Pendiente` gris
- Timer `00:00` en gris claro
- Botón `Iniciar` violeta sólido con icono Play

#### Variante `inprogress`
- Fondo oscuro `#1e1646`, `rounded-3xl`
- Icono de rayo en círculo semitransparente
- Badge `En Progreso` con punto pulsante animado
- Timer blanco grande, actualizándose cada segundo
- Botón `Finalizar` con borde translúcido blanco

#### Variante `done`
- Fondo verde esmeralda claro, `rounded-3xl`
- Icono de check en círculo verde
- Badge `Completada` verde
- Timer verde con tiempo final congelado
- Barra de progreso que se vacía en 10 segundos
- Texto "Se archiva en Xs"

**Props:**
```ts
interface CardProps {
  title: string
  status: TaskStatus         // 'pending' | 'inprogress' | 'done'
  time: number               // segundos del cronómetro
  countdown: number | null   // segundos hasta auto-archivado (solo en done)
  onStart: () => void
  onFinish: () => void
  onDelete: () => void
}
```

---

## 8. Hooks de React utilizados

### `useState` — 5 instancias

```ts
const [tasks, setTasks]               = useState<LocalTask[]>([])
const [input, setInput]               = useState("")
const [showHistory, setShowHistory]   = useState(false)
const [history, setHistory]           = useState<HistoryItem[]>([])
const [loadingHistory, setLoadingHistory] = useState(false)
```

| Estado | Tipo | Propósito |
|---|---|---|
| `tasks` | `LocalTask[]` | Lista de tareas activas con sus timers |
| `input` | `string` | Valor del campo de texto |
| `showHistory` | `boolean` | Controla visibilidad del modal de historial |
| `history` | `HistoryItem[]` | Registros del historial cargados de la API |
| `loadingHistory` | `boolean` | Muestra Spinner mientras carga el historial |

---

### `useEffect` — 3 instancias

**1. Carga inicial de tareas** (dependencias vacías — se ejecuta solo al montar)
```ts
useEffect(() => {
  fetch("/api/tasks")
    .then(r => r.json())
    .then((data: ServerTask[]) => setTasks(data.map(toLocal)))
}, [])
```

**2. Ticker global del cronómetro** — el corazón de la app
```ts
useEffect(() => {
  const interval = setInterval(() => {
    setTasks(prev => prev.map(task => {
      if (task.status === "inprogress" && task.startTimestamp) {
        const elapsed = Math.floor((Date.now() - task.startTimestamp) / 1000)
        return { ...task, time: task.accumulatedTime + elapsed }
      }
      if (task.status === "done" && task.doneAt !== null) {
        const remaining = Math.max(0, 10 - Math.floor((Date.now() - task.doneAt) / 1000))
        if (remaining !== task.countdown) return { ...task, countdown: remaining }
      }
      return task
    }))
  }, 1000)
  return () => clearInterval(interval)   // cleanup al desmontar
}, [])
```

Cada segundo:
- Las tareas `inprogress` recalculan `elapsed = Date.now() - startTimestamp`
- Las tareas `done` decrementan el countdown

La clave está en que `startTimestamp` viene del servidor (`new Date(task.startedAt).getTime()`), por lo que **el cronómetro reanuda correctamente tras recargar la página**.

**3. Limpieza de setTimeout al desmontar**
```ts
useEffect(() => {
  return () => doneTimers.current.forEach(t => clearTimeout(t))
}, [])
```

Cancela todos los timers pendientes si el componente se desmonta, evitando memory leaks.

---

### `useRef` — 1 instancia

```ts
const doneTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
```

Almacena un `Map` de `taskId → setTimeout` para los auto-archivados. Se usa `useRef` en lugar de `useState` porque:

- **No necesita re-render** al cambiar — es bookkeeping interno
- Persiste entre renders manteniendo su referencia
- Permite cancelar un timer específico si el usuario elimina una tarea antes de los 10s

**Flujo:**
```
handleFinish(id)
  ├─ setTimeout 10s → elimina tarea del estado
  └─ doneTimers.set(id, timerRef)

handleDelete(id)
  ├─ doneTimers.get(id) → clearTimeout()   ← cancela el auto-archivado
  └─ doneTimers.delete(id)
```

---

## 9. HeroUI — por qué y cómo se usa

### Por qué HeroUI v3

| Criterio | HeroUI v3 |
|---|---|
| Compatibilidad React 19 | Sí (peer dependency `>= 19`) |
| Compatibilidad Tailwind v4 | Sí (peer dependency `>= 4.0.0`) |
| Provider global requerido | No |
| Sistema de accesibilidad | `react-aria-components` de Adobe |
| Instalación | `npm install @heroui/react framer-motion` |

HeroUI v3 fue la única librería de componentes que a la fecha de este proyecto soporta de forma oficial la combinación **React 19 + Tailwind CSS v4**, evitando downgrades o configuraciones de compatibilidad.

### Configuración — `globals.css`

```css
/* Reemplaza @import "tailwindcss" */
/* HeroUI styles incluye Tailwind v4 internamente con @layer */
@import "@heroui/react/styles";
```

Internamente esto carga en orden:
```
tailwindcss → tw-animate-css → base HeroUI → componentes HeroUI → tema default → utilidades
```

### Componente usado: `Spinner`

```tsx
import { Spinner } from "@heroui/react"

<Spinner size="md" color="accent" />
```

Aparece en el modal de historial mientras se carga la data. HeroUI Spinner incluye la animación CSS y los colores del tema sin configuración adicional.

**Props disponibles:**
- `size`: `"sm"` | `"md"` | `"lg"` | `"xl"`
- `color`: `"accent"` | `"success"` | `"danger"` | `"warning"` | `"current"`

### Por qué no se usan más componentes de HeroUI

Durante el desarrollo se intentó usar `Button` y `Chip`:

- **`Button`**: en modo `fullWidth` con icono + texto, el contenido se renderizaba verticalmente. HeroUI v3 usa `react-aria-components` que gestiona el layout del botón internamente, y sobrescribir ese comportamiento requería más overrides que simplemente escribir un `<button>` nativo con Tailwind.

- **`Chip`**: los estilos de color/fondo no se aplicaban porque internamente HeroUI genera clases dinámicas a través de `tailwind-variants`. Esas clases necesitan ser detectadas por Tailwind en build time, y la detección automática en proyectos Tailwind v4 con HeroUI v3 aún tiene edge cases donde las clases no se incluyen en el bundle CSS final.

**Decisión:** se usan `<button>` y `<span>` nativos con Tailwind para badges y botones de acción. HeroUI se conserva para `Spinner` donde sus estilos funcionan de forma confiable.

---

## 10. Sistema de estilos

### Tailwind CSS v4

Sin archivo `tailwind.config.js` — la configuración va en CSS y PostCSS:

```js
// postcss.config.mjs
plugins: { "@tailwindcss/postcss": {} }
```

Las clases de Tailwind se detectan automáticamente en archivos `.tsx` y `.ts`.

### Animaciones — `globals.css`

```css
/* Entrada de cards */
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.card-enter { animation: fadeSlideUp 0.3s ease-out forwards; }

/* Entrada del modal */
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}
.modal-enter { animation: scaleIn 0.2s ease-out forwards; }

/* Punto pulsante — tarea en progreso */
@keyframes pulseDot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.4; transform: scale(0.75); }
}
.pulse-dot { animation: pulseDot 1.4s ease-in-out infinite; }
```

### Paleta de colores

| Elemento | Clase Tailwind |
|---|---|
| Fondo global | `from-violet-100 via-purple-50 to-indigo-100` |
| Logo | `from-violet-500 to-indigo-600` |
| Card pendiente | `bg-white border-gray-100` |
| Card en progreso | `bg-[#1e1646]` |
| Card completada | `bg-emerald-50 border-emerald-200` |
| Badge pendiente | `bg-slate-100 text-slate-500` |
| Badge en progreso | `bg-violet-100 text-violet-600` |
| Badge completada | `bg-emerald-100 text-emerald-600` |
| Botón Iniciar | `bg-violet-600 hover:bg-violet-700` |
| Botón "+" | `bg-violet-600 disabled:bg-violet-200` |

---

## 11. Tipos TypeScript

### `types/task.ts`

```ts
type TaskStatus = "pending" | "inprogress" | "done"

interface Task {
  id: string
  title: string
  status: TaskStatus
  time: number              // segundos mostrados en cronómetro (calculado en cliente)
  accumulatedTime: number   // tiempo acumulado antes de pausar
  startTimestamp: number | null  // Date.getTime() de inicio (para ticker)
  inProgressDuration: number | null  // segundos finales (del servidor)
}

interface HistoryItem {
  id: string
  title: string
  reason: "deleted" | "done"
  inProgressDuration: number | null
  archivedAt: string       // ISO string
  originalCreatedAt: string
}
```

### Tipo extendido local (en `page.tsx`)

```ts
type LocalTask = Task & {
  doneAt: number | null    // timestamp para calcular el countdown
  countdown: number | null // segundos restantes antes de auto-archivar
}
```

### Función `toLocal(t: ServerTask): LocalTask`

Convierte la respuesta del servidor al formato del cliente:

| Caso | Qué hace |
|---|---|
| `status === "inprogress"` | Calcula `elapsed = (Date.now() - startedAt) / 1000` para reanudar el timer |
| `status === "done"` | Calcula `countdown = 10 - (Date.now() - doneAt) / 1000` |
| `status === "pending"` | Inicializa `time: 0`, `countdown: null` |

---

## 12. Variables de entorno

Crear `.env.local` en la raíz de `task-time/`:

```env
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

| Variable | Descripción |
|---|---|
| `MONGODB_URI` | URI de conexión a MongoDB Atlas o instancia local |

`.env.local` está en `.gitignore` y nunca debe subirse al repositorio.

---

## 13. Cómo correr el proyecto

### Prerrequisitos

- Node.js >= 18
- Cuenta en [MongoDB Atlas](https://cloud.mongodb.com) (capa gratuita M0) o MongoDB corriendo localmente

### Instalación

```bash
cd task-time
npm install
```

### Configurar la base de datos

1. Crear un cluster en MongoDB Atlas
2. Crear un usuario con permisos de lectura/escritura
3. Agregar la IP `0.0.0.0/0` al Network Access (o la IP específica)
4. Copiar la URI de conexión
5. Crear `.env.local`:
   ```env
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/task-timer
   ```

### Modo desarrollo

```bash
npm run dev
```

Abre `http://localhost:3000`

### Producción

```bash
npm run build
npm start
```

### Scripts

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con hot-reload (Turbopack) |
| `npm run build` | Build optimizado para producción |
| `npm start` | Inicia el servidor de producción |
| `npm run lint` | ESLint sobre todo el proyecto |

---

## Diagrama de flujo — ciclo de vida de una tarea

```
[Usuario escribe título]
        │
        ▼
POST /api/tasks ──────────────► MongoDB tasks { status: 'pending' }
        │
        ▼
[Card blanca — estado Pendiente]
        │
  [Presiona Iniciar]
        │
        ▼
PATCH /api/tasks/:id ─────────► MongoDB tasks { status: 'inprogress', startedAt: now }
        │
        ▼
[Card oscura — cronómetro corre en cliente cada 1s]
        │
  [Presiona Finalizar]
        │
        ▼
PATCH /api/tasks/:id ─────────► MongoDB tasks { status: 'done', doneAt: now, inProgressDuration: N }
        │
        ▼
[Card verde — countdown 10s visible]
        │
   10s después
        │
   ┌────┴──────────────────────────────────────────┐
   │ Cliente: setTasks filtra la tarea del estado  │
   │ Servidor (próximo GET): cleanupExpiredDone()  │
   │   → insertMany histories { reason: 'done' }   │
   │   → deleteMany tasks                          │
   └───────────────────────────────────────────────┘

  [Presiona X en cualquier momento]
        │
        ▼
DELETE /api/tasks/:id ────────► insertOne histories { reason: 'deleted' }
        │                        deleteOne task
        ▼
[Card desaparece del estado local inmediatamente]
```
