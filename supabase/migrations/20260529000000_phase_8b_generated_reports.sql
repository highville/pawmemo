create table if not exists public.generated_reports (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade,
  report_type text not null check (report_type in ('weekly_paw_letter', 'vet_ready_summary')),
  title text,
  content text not null,
  period_start date,
  period_end date,
  source_memory_count integer,
  source_care_signal_count integer,
  included_photo_records boolean not null default false,
  model text,
  created_at timestamptz not null default now()
);

create index if not exists generated_reports_owner_id_idx on public.generated_reports(owner_id);
create index if not exists generated_reports_pet_id_idx on public.generated_reports(pet_id);
create index if not exists generated_reports_report_type_idx on public.generated_reports(report_type);
create index if not exists generated_reports_created_at_idx on public.generated_reports(created_at desc);

alter table public.generated_reports enable row level security;

drop policy if exists "Generated reports are visible to their owner" on public.generated_reports;
create policy "Generated reports are visible to their owner"
on public.generated_reports for select
using (owner_id = auth.uid());

drop policy if exists "Generated reports are inserted by their owner" on public.generated_reports;
create policy "Generated reports are inserted by their owner"
on public.generated_reports for insert
with check (
  owner_id = auth.uid()
  and exists (
    select 1 from public.pets
    where pets.id = generated_reports.pet_id
    and pets.owner_id = auth.uid()
  )
);

drop policy if exists "Generated reports are updated by their owner" on public.generated_reports;
create policy "Generated reports are updated by their owner"
on public.generated_reports for update
using (owner_id = auth.uid())
with check (
  owner_id = auth.uid()
  and exists (
    select 1 from public.pets
    where pets.id = generated_reports.pet_id
    and pets.owner_id = auth.uid()
  )
);

drop policy if exists "Generated reports are deleted by their owner" on public.generated_reports;
create policy "Generated reports are deleted by their owner"
on public.generated_reports for delete
using (owner_id = auth.uid());

grant usage on schema public to authenticated;

grant select, insert, update, delete
on table public.generated_reports
to authenticated;
