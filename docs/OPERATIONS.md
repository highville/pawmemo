# PawMemo Operations Notes

This document tracks the post-first-deployment operating checklist for PawMemo. It intentionally avoids real secrets, production keys, and private environment values.

## Production

- Production URL: `https://YOUR_PRODUCTION_DOMAIN`
- Hosting: Vercel
- Backend: Supabase
- AI provider: OpenAI, server-side only

## Required Environment Variables

Configure these in Vercel Project Settings and in local `.env.local` for development:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`

Do not configure or use `SUPABASE_SERVICE_ROLE_KEY` for the app runtime.

## Supabase Auth Checklist

In Supabase Dashboard, check Authentication URL configuration:

- Site URL: `https://YOUR_PRODUCTION_DOMAIN`
- Redirect URLs:
  - `https://YOUR_PRODUCTION_DOMAIN/auth/callback`
  - `https://YOUR_VERCEL_PROJECT.vercel.app/auth/callback`
  - Vercel preview callback URLs if preview auth testing is needed
  - `http://localhost:3000/auth/callback` for local development

Do not change production Auth settings without a planned test window.

## Migration Checklist

These migrations should be applied manually in order:

1. `20260526000000_phase_2a_core_schema.sql`
2. `20260526001000_grant_authenticated_core_tables.sql`
3. `20260527000000_phase_3a_memory_photos.sql`
4. `20260528000000_phase_4b1_ai_usage_events.sql`

Do not run `supabase db push` unless the migration process is intentionally changed.

## Storage Checklist

Supabase Storage must include:

- Bucket: `memory-photos`
- Public access: disabled
- Access: authenticated users only through owner-scoped storage policies
- App behavior: photo thumbnails are loaded through signed URLs

Do not make the bucket public.

## Post-Deploy Smoke Test

After every production deploy, test:

- Landing page loads
- Sign up or sign in works
- `/app` redirects unauthenticated users to sign in
- Existing pet and memories load for authenticated users
- Text memory creation works
- Manual tag creation works
- Photo memory creation works
- Timeline displays text and photo memories
- AI tag suggestions work
- Weekly Paw Letter generation works
- Vet-ready Summary generation works
- Sign out works

## Current Feature Status

Working:

- Auth and route protection
- Pet onboarding
- Text and photo memories
- Manual tags
- AI tag suggestions
- Neutral care signals
- Timeline
- Weekly Paw Letter
- Vet-ready Summary
- AI usage logging

Static or preview-only:

- Memory Mosaic uses preview-style mock content
- Pricing is a placeholder

## Known Limitations

- No PDF export yet
- No email sending yet
- No social sharing yet
- No payment integration yet
- No image analysis yet
- Generated Weekly Paw Letter and Vet-ready Summary are not persisted yet
- Pet profile photo upload is not implemented yet
- Production test data cleanup is manual for now
- No in-app AI cost dashboard yet; usage can be monitored through OpenAI Platform and `ai_usage_events`

## Production Test Data Strategy

Do not delete production users, pets, memories, assets, tags, or care signals casually.

Recommended later:

- Use a dedicated production test account naming pattern such as `pawmemo.prodtest+YYYYMMDD@example.com`
- Keep test pet names obviously non-customer-facing, such as `PawMemo Test Pet`
- Add a lightweight manual cleanup checklist before launch
- Consider a separate Supabase project for staging before broad user testing

## Recommended Next Phases

- Phase 8A: User-facing onboarding polish
- Phase 8B: Report persistence
- Phase 8C: PDF/export
- Phase 8D: Custom domain and product branding
- Phase 9A: Payment planning
