# MoodJournal

Diario emocional donde cada entrada se analiza para detectar el estado de ánimo, con estadísticas, gráficas y rachas de escritura para ayudarte a crear el hábito de reflexionar.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)

## Funcionalidades

- **Autenticación** de usuarios con Supabase Auth.
- **Entradas de diario** de texto libre, asociadas a una fecha; crear, editar y eliminar.
- **Análisis de sentimiento** de cada entrada (positivo, negativo o neutro) con un resumen y una puntuación, calculado en una Edge Function.
- **Gráfica emocional** y tarjetas de estadísticas.
- **Rachas** de días consecutivos escribiendo.
- **Frases motivacionales** en el panel, según el sentimiento de tus entradas.
- **Preferencias** por usuario, con modo claro y oscuro.
- **Seguridad por filas (RLS):** cada usuario solo puede leer y modificar sus propios datos.

## Arquitectura

```
React + TypeScript (Vite, Tailwind)
        │
        ├── Supabase Auth ........... registro e inicio de sesión
        ├── Supabase Postgres ....... profiles, journal_entries, user_preferences,
        │                             user_streaks, motivational_quotes (con RLS)
        └── Edge Function ........... analyze-sentiment (Deno)
```

El análisis de sentimiento actual es **basado en léxico**: cuenta palabras positivas y negativas (en inglés) y calcula una puntuación según su intensidad. Es rápido y no depende de servicios externos, pero es una primera versión; una mejora natural es reemplazarlo por un modelo multilingüe.

## Estructura

```
src/
  components/   Auth, Dashboard, JournalEntry, EntryCard, EmotionalChart,
                StatCard, StreakDisplay, SettingsModal
  contexts/     AuthContext, ThemeContext
  lib/          Cliente de Supabase y tipos
supabase/
  migrations/   Esquema SQL con políticas RLS
  functions/    analyze-sentiment
```

## Cómo ejecutarlo

Requisitos: Node.js 18+ y un proyecto de [Supabase](https://supabase.com).

```bash
git clone https://github.com/Sandrez12/MoodJournal.git
cd MoodJournal
npm install

cp .env.example .env      # completa con la URL y la anon key de tu proyecto
```

1. Aplica las migraciones de `supabase/migrations/` en tu proyecto (SQL Editor o Supabase CLI).
2. Despliega la función: `supabase functions deploy analyze-sentiment`.
3. Inicia la app:

```bash
npm run dev
```

## Tecnologías

React 18, TypeScript, Vite, Tailwind CSS, Supabase (Auth, Postgres, Edge Functions), Lucide Icons.
