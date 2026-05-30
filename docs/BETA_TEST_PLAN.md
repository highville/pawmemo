# PawMemo Private Beta Test Plan

This plan is for small private beta testing before broader user testing. It should not contain real API keys, private environment values, tester passwords, or production secrets.

## Beta Testing Goal

Validate whether PawMemo feels clear, trustworthy, and useful for pet parents who want a private place to save everyday memories and turn those notes into gentle recaps.

The beta should answer:

- Do testers understand what PawMemo is for within the first minute?
- Can testers create a pet profile and save memories without help?
- Do tags, photo memories, Timeline, and Reports feel easy to find?
- Do AI tag suggestions, Weekly Paw Letters, and Vet-ready Summaries feel helpful without feeling overpromising?
- Are safety and privacy expectations clear enough for a small launch?

## Who Should Test

Recommended testers:

- Pet parents who regularly take photos or notes about their pet
- People who have taken a pet to a vet and would understand the value of organized notes
- A mix of mobile-first and desktop users
- At least one tester who is not familiar with the product idea

Avoid using broad public testers until the beta feedback loop is ready and production test data cleanup is planned.

## Test Account Strategy

Preferred approach:

- Ask each tester to create their own account using an email they can access
- Tell testers that PawMemo is in private beta and should not be used for urgent care decisions
- Do not share reusable passwords in public channels
- Do not ask testers to enter sensitive medical, financial, or private identity information

Internal testing:

- Use clearly named disposable test accounts for repeat smoke tests
- Keep test pet names obviously non-customer-facing when possible
- Do not delete production users or records casually
- Track cleanup needs separately before broader launch

## Suggested Tester Flow

Ask testers to complete this script:

1. Open `https://pawmemo.vercel.app`
2. Read the landing page and describe what they think PawMemo does
3. Create an account or sign in
4. Create a pet profile
5. Add a text memory from Journal
6. Add one memory with a photo
7. Try selecting a manual tag
8. Try AI tag suggestions once
9. Open Timeline and find the memories they created
10. Open Reports
11. Generate a Weekly Paw Letter
12. Generate a Vet-ready Summary
13. Open saved reports
14. Copy a report
15. Try Print / Save as PDF through the browser print dialog
16. Review Settings
17. Sign out and sign back in if they have time

## Feedback Questions

Ask these questions after the test:

- Was it clear what PawMemo is for?
- Was sign-up easy?
- Was pet creation clear?
- Was Quick Entry easy to understand?
- Was it obvious how to reach Timeline, Reports, and Settings?
- Did photo memory creation feel simple?
- Did manual tags make sense?
- Did AI suggestions feel useful?
- Did the Weekly Paw Letter feel emotionally valuable?
- Did the Vet-ready Summary feel practical and safe?
- Did any AI wording feel too confident, medical, or uncomfortable?
- Was saved report copy, delete, or print behavior clear?
- What felt confusing?
- What felt delightful or worth keeping?
- What would make you use this again?
- What would stop you from trusting it?

## Known Limitations To Tell Testers Upfront

- Pricing is preview only
- Payments are not active
- Pet profile photo upload is not available yet
- Account deletion is coming later
- Export all memories is coming later
- AI suggestions are optional
- Vet-ready Summary organizes notes and is not a diagnosis
- Browser Print / Save as PDF is available for saved reports, but there is no dedicated PDF generation pipeline yet
- PawMemo should not be used for emergency decisions or as a replacement for veterinary care

## Safety And Privacy Notes

- PawMemo is designed as a private memory journal
- AI features should only assist with optional tags, letters, and summaries
- AI output should not diagnose, infer disease, or recommend treatment
- Vet-ready Summary should use note-based language only
- Production data is protected by Supabase RLS and user-owned access rules
- Private memory photos are stored in a private bucket and displayed through signed URLs
- Saved report deletion removes only the saved report row, not source memories, photos, tags, or care signals

## Bug Report Format

Use this format for tester bug reports:

- Tester name or code:
- Device:
- Browser:
- Approximate time:
- Page or feature:
- What they were trying to do:
- What happened:
- What they expected:
- Screenshot or screen recording, if comfortable:
- Severity:
- Notes:

## Internal Issue Triage

Classify feedback into one of these buckets:

- Critical bug: Blocks sign-in, memory creation, reports, or data privacy expectations
- Confusing UX: Tester can continue but does not understand what to do
- Copy issue: Wording is unclear, too technical, too confident, or not warm enough
- Feature request: New capability outside the MVP surface
- Trust/safety concern: Privacy, AI, medical wording, or data handling concern
- Nice-to-have: Polish that would improve delight but does not block beta use

## MVP Readiness Success Criteria

PawMemo is ready for a wider small beta when:

- Most testers can describe PawMemo accurately after seeing the landing page
- Most testers can create a pet profile without help
- Most testers can add text and photo memories without help
- Testers can find Timeline, Reports, and Settings from the app UI
- Weekly Paw Letter is perceived as warm and emotionally useful
- Vet-ready Summary is perceived as practical and clearly non-diagnostic
- No tester reports that pricing implies active payment
- No tester reports that AI appears to give medical advice
- No critical auth, data access, or report persistence issues are found
- Known limitations are understandable and not surprising

## Follow-Up After Each Beta Round

- Review critical bugs first
- Group repeated UX confusion by page or feature
- Update launch checklist if a new known issue appears
- Decide whether fixes are needed before inviting more testers
- Avoid adding large new features until the beta feedback patterns are clear
