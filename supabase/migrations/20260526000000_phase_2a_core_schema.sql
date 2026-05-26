create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  species text,
  birthday date,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade,
  title text not null,
  body text not null,
  occurred_at timestamptz not null default now(),
  image_url text,
  mood text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  category text,
  created_at timestamptz not null default now(),
  unique (owner_id, name, category)
);

create table if not exists public.memory_tags (
  memory_id uuid not null references public.memories(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (memory_id, tag_id)
);

create table if not exists public.care_signals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade,
  memory_id uuid references public.memories(id) on delete set null,
  signal_type text not null,
  note text not null,
  observed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pets_owner_id_idx on public.pets(owner_id);
create index if not exists memories_owner_id_idx on public.memories(owner_id);
create index if not exists memories_pet_id_idx on public.memories(pet_id);
create index if not exists tags_owner_id_idx on public.tags(owner_id);
create index if not exists memory_tags_owner_id_idx on public.memory_tags(owner_id);
create index if not exists care_signals_owner_id_idx on public.care_signals(owner_id);
create index if not exists care_signals_pet_id_idx on public.care_signals(pet_id);
create index if not exists care_signals_memory_id_idx on public.care_signals(memory_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_pets_updated_at on public.pets;
create trigger set_pets_updated_at
before update on public.pets
for each row execute function public.set_updated_at();

drop trigger if exists set_memories_updated_at on public.memories;
create trigger set_memories_updated_at
before update on public.memories
for each row execute function public.set_updated_at();

drop trigger if exists set_care_signals_updated_at on public.care_signals;
create trigger set_care_signals_updated_at
before update on public.care_signals
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.pets enable row level security;
alter table public.memories enable row level security;
alter table public.tags enable row level security;
alter table public.memory_tags enable row level security;
alter table public.care_signals enable row level security;

drop policy if exists "Profiles are visible to their owner" on public.profiles;
create policy "Profiles are visible to their owner"
on public.profiles for select
using (id = auth.uid());

drop policy if exists "Profiles are inserted by their owner" on public.profiles;
create policy "Profiles are inserted by their owner"
on public.profiles for insert
with check (id = auth.uid());

drop policy if exists "Profiles are updated by their owner" on public.profiles;
create policy "Profiles are updated by their owner"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Profiles are deleted by their owner" on public.profiles;
create policy "Profiles are deleted by their owner"
on public.profiles for delete
using (id = auth.uid());

drop policy if exists "Pets are visible to their owner" on public.pets;
create policy "Pets are visible to their owner"
on public.pets for select
using (owner_id = auth.uid());

drop policy if exists "Pets are inserted by their owner" on public.pets;
create policy "Pets are inserted by their owner"
on public.pets for insert
with check (owner_id = auth.uid());

drop policy if exists "Pets are updated by their owner" on public.pets;
create policy "Pets are updated by their owner"
on public.pets for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "Pets are deleted by their owner" on public.pets;
create policy "Pets are deleted by their owner"
on public.pets for delete
using (owner_id = auth.uid());

drop policy if exists "Memories are visible to their owner" on public.memories;
create policy "Memories are visible to their owner"
on public.memories for select
using (owner_id = auth.uid());

drop policy if exists "Memories are inserted by their owner" on public.memories;
create policy "Memories are inserted by their owner"
on public.memories for insert
with check (
  owner_id = auth.uid()
  and exists (
    select 1 from public.pets
    where pets.id = memories.pet_id
    and pets.owner_id = auth.uid()
  )
);

drop policy if exists "Memories are updated by their owner" on public.memories;
create policy "Memories are updated by their owner"
on public.memories for update
using (owner_id = auth.uid())
with check (
  owner_id = auth.uid()
  and exists (
    select 1 from public.pets
    where pets.id = memories.pet_id
    and pets.owner_id = auth.uid()
  )
);

drop policy if exists "Memories are deleted by their owner" on public.memories;
create policy "Memories are deleted by their owner"
on public.memories for delete
using (owner_id = auth.uid());

drop policy if exists "Tags are visible to their owner" on public.tags;
create policy "Tags are visible to their owner"
on public.tags for select
using (owner_id = auth.uid());

drop policy if exists "Tags are inserted by their owner" on public.tags;
create policy "Tags are inserted by their owner"
on public.tags for insert
with check (owner_id = auth.uid());

drop policy if exists "Tags are updated by their owner" on public.tags;
create policy "Tags are updated by their owner"
on public.tags for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "Tags are deleted by their owner" on public.tags;
create policy "Tags are deleted by their owner"
on public.tags for delete
using (owner_id = auth.uid());

drop policy if exists "Memory tags are visible to their owner" on public.memory_tags;
create policy "Memory tags are visible to their owner"
on public.memory_tags for select
using (
  exists (
    select 1 from public.memories
    where memories.id = memory_tags.memory_id
    and memories.owner_id = auth.uid()
  )
);

drop policy if exists "Memory tags are inserted by their owner" on public.memory_tags;
create policy "Memory tags are inserted by their owner"
on public.memory_tags for insert
with check (
  owner_id = auth.uid()
  and exists (
    select 1 from public.memories
    where memories.id = memory_tags.memory_id
    and memories.owner_id = auth.uid()
  )
  and exists (
    select 1 from public.tags
    where tags.id = memory_tags.tag_id
    and tags.owner_id = auth.uid()
  )
);

drop policy if exists "Memory tags are updated by their owner" on public.memory_tags;
create policy "Memory tags are updated by their owner"
on public.memory_tags for update
using (
  exists (
    select 1 from public.memories
    where memories.id = memory_tags.memory_id
    and memories.owner_id = auth.uid()
  )
)
with check (
  owner_id = auth.uid()
  and exists (
    select 1 from public.memories
    where memories.id = memory_tags.memory_id
    and memories.owner_id = auth.uid()
  )
  and exists (
    select 1 from public.tags
    where tags.id = memory_tags.tag_id
    and tags.owner_id = auth.uid()
  )
);

drop policy if exists "Memory tags are deleted by their owner" on public.memory_tags;
create policy "Memory tags are deleted by their owner"
on public.memory_tags for delete
using (
  exists (
    select 1 from public.memories
    where memories.id = memory_tags.memory_id
    and memories.owner_id = auth.uid()
  )
);

drop policy if exists "Care signals are visible to their owner" on public.care_signals;
create policy "Care signals are visible to their owner"
on public.care_signals for select
using (owner_id = auth.uid());

drop policy if exists "Care signals are inserted by their owner" on public.care_signals;
create policy "Care signals are inserted by their owner"
on public.care_signals for insert
with check (
  owner_id = auth.uid()
  and exists (
    select 1 from public.pets
    where pets.id = care_signals.pet_id
    and pets.owner_id = auth.uid()
  )
  and (
    memory_id is null
    or exists (
      select 1 from public.memories
      where memories.id = care_signals.memory_id
      and memories.owner_id = auth.uid()
    )
  )
);

drop policy if exists "Care signals are updated by their owner" on public.care_signals;
create policy "Care signals are updated by their owner"
on public.care_signals for update
using (owner_id = auth.uid())
with check (
  owner_id = auth.uid()
  and exists (
    select 1 from public.pets
    where pets.id = care_signals.pet_id
    and pets.owner_id = auth.uid()
  )
  and (
    memory_id is null
    or exists (
      select 1 from public.memories
      where memories.id = care_signals.memory_id
      and memories.owner_id = auth.uid()
    )
  )
);

drop policy if exists "Care signals are deleted by their owner" on public.care_signals;
create policy "Care signals are deleted by their owner"
on public.care_signals for delete
using (owner_id = auth.uid());
