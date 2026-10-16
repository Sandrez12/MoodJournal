# MoodJournal

Diario emocional donde cada entrada se analiza para detectar el estado de ánimo, con estadísticas, gráficas y rachas de escritura para ayudarte a crear el hábito de reflexionar.

**Ver en vivo:** https://moodjournal-theta.vercel.app

![CI](https://github.com/Sandrez12/MoodJournal/actions/workflows/ci.yml/badge.svg)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)

## Funcionalidades

- **Autenticación** de usuarios con Supabase Auth.
- **Entradas de diario** de texto libre, asociadas a una fecha; crear, editar y eliminar.
- **Análisis de sentimiento** de cada entrada (positivo, negativo o neutro) con una puntuación y un resumen. Funciona en **español e inglés**, entiende negaciones ("no estoy feliz") y se calcula en el navegador, sin servicios externos.
- **Gráfica emocional** y tarjetas de estadísticas.
- **Rachas** de días consecutivos escribiendo.
- **Frases motivacionales** en el panel, según el sentimiento de tus entradas.
- **Preferencias** por usuario, con modo claro y oscuro.
- **Seguridad por filas (RLS):** cada persona solo puede leer y modificar sus propios datos.

## Arquitectura

```
React + TypeScript (Vite, Tailwind)  ← desplegado en Vercel
        │
        ├── src/lib/sentiment.ts ..... análisis de sentimiento (léxico ES/EN, con pruebas)
        ├── Supabase Auth ............ registro e inicio de sesión
        └── Supabase Postgres ........ profiles, journal_entries, user_preferences,
                                       user_streaks, motivational_quotes (todas con RLS)
```

El análisis es **basado en léxico**: cuenta palabras positivas y negativas, invierte el sentido si hay una negación cercana y calcula la puntuación según la intensidad. Es rápido, privado (el texto no sale del navegador) y no cuesta nada; una mejora futura sería reemplazarlo por un modelo multilingüe.

## Estructura

```
src/
  components/   Auth, Dashboard, JournalEntry, EntryCard, EmotionalChart,
                StatCard, StreakDisplay, SettingsModal
  contexts/     AuthContext, ThemeContext
  lib/          Cliente de Supabase, tipos y sentiment.ts (+ pruebas)
supabase/
  migrations/   Esquema SQL con políticas RLS (fuente de verdad)
  setup.sql     Las mismas migraciones en un solo archivo para pegar en el editor SQL
```

## Cómo ejecutarlo

Requisitos: Node.js 18+ y un proyecto de [Supabase](https://supabase.com) (el plan gratuito basta).

1. **Crea las tablas:** en Supabase abre **SQL Editor → New query**, pega el contenido de [`supabase/setup.sql`](supabase/setup.sql) y ejecútalo. También puedes aplicar `supabase/migrations/` con la CLI de Supabase.
2. **Instala y configura:**

   ```bash
   git clone https://github.com/Sandrez12/MoodJournal.git
   cd MoodJournal
   npm install
   cp .env.example .env      # URL y anon key de Project Settings → API
   npm run dev
   ```

3. **Auth en desarrollo y producción:** en **Authentication → URL Configuration** agrega tu URL (`http://localhost:5173` y la de Vercel) como *Site URL* / *Redirect URL*. Si no quieres confirmar correos mientras pruebas, desactiva **Confirm email** en Authentication → Providers → Email.

## Scripts

```bash
npm run dev        # servidor de desarrollo
npm run build      # compilación de producción
npm run typecheck  # TypeScript
npm run lint       # ESLint
npm test           # pruebas (Vitest)
```

## Despliegue en Vercel

Vercel detecta Vite automáticamente. Solo define estas variables de entorno (Project → Settings → Environment Variables):

| Variable | Valor |
|---|---|
| `VITE_SUPABASE_URL` | `https://<tu-proyecto>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | La clave pública `anon` (nunca la `service_role`) |

```bash
npm i -g vercel
vercel --prod
```

## Tecnologías

React 18, TypeScript, Vite, Tailwind CSS, Supabase (Auth y Postgres), Vitest, Lucide Icons.
