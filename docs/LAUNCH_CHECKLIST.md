# PawMemo Launch Checklist

This checklist captures the current MVP launch state after the production smoke test. It should not contain real API keys, private environment values, or production secrets.

## Production

- Production URL: `https://pawmemo.vercel.app`
- Hosting: Vercel
- Backend: Supabase
- AI provider: OpenAI, server-side only
- Latest verified production smoke status: passing after Phase 11B

## Current MVP Feature Status

Working in production:

- Supabase Auth sign-in and sign-up
- Route protection for authenticated app pages
- Pet profile creation and loading
- Text memories
- One-photo memory attachments through the private `memory-photos` bucket
- Manual memory tags
- AI tag suggestions
- AI usage quota guardrails
- Timeline with text, photo, and tag memories
- Weekly Paw Letter generation
- Vet-ready Summary generation
- Saved reports persisted in `generated_reports`
- Saved report list
- Saved report detail pages
- Copy report
- Delete saved report
- Print / Save as PDF through browser print

## Production Smoke Test Checklist

Use this checklist after every production deploy:

- Open `https://pawmemo.vercel.app`
- Open `/pricing`
- Confirm pricing is preview-only and does not imply active payment
- Open `/auth/sign-in`
- Open `/auth/sign-up`
- Confirm unauthenticated `/app` redirects to `/auth/sign-in?next=%2Fapp`
- Sign in with the disposable PawMemo production test account
- Confirm `/app` loads after sign-in
- Confirm the existing pet loads
- Confirm Quick Entry is visible
- Confirm Timeline loads text, photo, and tag memories
- Confirm Reports index loads
- Confirm Recent saved reports loads
- Open a saved report detail page
- Confirm Copy report is present
- Confirm Delete report confirmation is present; cancel unless using disposable data
- Confirm Print / Save as PDF is present
- Open Weekly Paw Letter
- Open Vet-ready Summary
- Confirm Settings inactive actions are clearly marked as coming later
- Test at most one lightweight AI flow if needed
- Confirm no unexpected quota message appears

## Known Limitations

- No real payments yet
- Pricing is preview only
- No server-side PDF generation
- No email sending
- No social sharing
- No push notifications
- No image analysis
- Pet profile photo upload is not implemented yet
- Account deletion is coming later
- Export all memories is coming later
- Saved reports can be printed through browser print, but there is no generated PDF file pipeline yet

## Known Issue To Monitor

- Rare post-login raw stream-like rendering flash on `/app`
- Refresh resolves it
- It was observed once after sign-in during Phase 11B production smoke testing
- It did not reproduce during later route smoke testing
- Treat as non-blocking for now, but revisit if users report repeated post-login rendering artifacts

## Security Notes

- `.env.local` must never be committed
- `OPENAI_API_KEY` must remain server-only
- Do not expose AI keys through `NEXT_PUBLIC_` environment variables
- `SUPABASE_SERVICE_ROLE_KEY` is not used by the app runtime
- Supabase RLS protects user-owned data
- Private memory photos are served through signed URLs
- `generated_reports` deletion only deletes saved report rows
- Deleting a saved report must not delete source memories, photos, tags, or care signals
- Do not store prompts, raw provider responses, or API keys in user-facing reports

## Pre-Launch Checklist

- Confirm Vercel production deployment is ready
- Confirm required Vercel environment variables are configured:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `OPENAI_API_KEY`
- Confirm Supabase Auth Site URL and Redirect URLs include the production domain
- Confirm the private `memory-photos` bucket exists and is not public
- Confirm all migrations have been manually applied in production
- Confirm `.env.local` is ignored locally
- Run `npx.cmd tsc --noEmit`
- Run `npm.cmd run build`
- Run the production smoke test checklist above

## Post-Deploy Smoke Checklist

- Public landing page renders
- Pricing preview copy is correct
- Auth pages render
- Unauthenticated route protection works
- Sign-in works
- Existing pet and memories load
- Timeline renders text/photo/tag memories
- Reports index and saved reports load
- Saved report copy/delete confirmation/print actions are present
- Weekly Paw Letter page loads
- Vet-ready Summary page loads
- Settings inactive actions are clear
- One lightweight AI flow works without unexpected quota errors

## Recommended Next Phases

- Phase 12A: Launch polish for custom domain, metadata, and product branding
- Phase 12B: Production issue monitoring and error reporting plan
- Phase 12C: Export all memories planning
- Phase 13A: Payment planning
- Phase 13B: Account deletion planning
