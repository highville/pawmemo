# PawMemo

PawMemo is a gentle, private pet memory journal for saving quick notes, photos, care signals, and meaningful moments in one warm space.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- React
- Supabase Auth, Postgres, and Storage
- OpenAI server-side generation
- lucide-react

## Current Status

PawMemo is deployed to Vercel and connected to Supabase for authenticated users.

Implemented:

- Supabase Auth and protected `/app` routes
- Pet onboarding
- Text memories
- One optional private photo per memory
- Manual tags and AI-assisted tag suggestions
- Neutral care signal tracking
- Timeline with real user data and private signed photo thumbnails
- Manual Weekly Paw Letter generation
- Manual Vet-ready Summary generation
- AI usage logging

Intentional limitations are tracked in [docs/OPERATIONS.md](docs/OPERATIONS.md).

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Environment Variables

Copy `.env.example` to `.env.local` for local development and fill in the values manually.

Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`

Do not use or commit `SUPABASE_SERVICE_ROLE_KEY`.

## Main Routes

- `/` - Landing page
- `/onboarding` - Pet onboarding
- `/app` - Home / Quick Entry
- `/app/timeline` - Timeline
- `/app/mosaic` - Memory Mosaic preview
- `/app/reports` - Reports hub
- `/app/reports/weekly` - Weekly Paw Letter
- `/app/reports/vet-summary` - Vet-ready Summary
- `/pricing` - Pricing placeholder
- `/app/settings` - Settings

## Deployment Notes

See [docs/OPERATIONS.md](docs/OPERATIONS.md) for the Vercel, Supabase, storage, migration, smoke test, and production operations checklist.
