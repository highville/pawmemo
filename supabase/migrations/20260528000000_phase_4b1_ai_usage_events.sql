create table if not exists public.ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  feature text not null,
  provider text not null,
  model text not null,
  input_tokens integer,
  output_tokens integer,
  total_tokens integer,
  success boolean not null default false,
  error_code text,
  created_at timestamptz not null default now()
);

create index if not exists ai_usage_events_owner_id_idx on public.ai_usage_events(owner_id);
create index if not exists ai_usage_events_created_at_idx on public.ai_usage_events(created_at);
create index if not exists ai_usage_events_feature_idx on public.ai_usage_events(feature);

alter table public.ai_usage_events enable row level security;

drop policy if exists "AI usage events are visible to their owner" on public.ai_usage_events;
create policy "AI usage events are visible to their owner"
on public.ai_usage_events for select
using (owner_id = auth.uid());

drop policy if exists "AI usage events are inserted by their owner" on public.ai_usage_events;
create policy "AI usage events are inserted by their owner"
on public.ai_usage_events for insert
with check (owner_id = auth.uid());

grant select, insert
on table public.ai_usage_events
to authenticated;
