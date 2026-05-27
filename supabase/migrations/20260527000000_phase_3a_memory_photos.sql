create table if not exists public.memory_assets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade,
  memory_id uuid not null references public.memories(id) on delete cascade,
  storage_bucket text not null,
  storage_path text not null,
  mime_type text,
  file_size integer,
  created_at timestamptz not null default now(),
  unique (storage_bucket, storage_path)
);

create index if not exists memory_assets_owner_id_idx on public.memory_assets(owner_id);
create index if not exists memory_assets_pet_id_idx on public.memory_assets(pet_id);
create index if not exists memory_assets_memory_id_idx on public.memory_assets(memory_id);

alter table public.memory_assets enable row level security;

drop policy if exists "Memory assets are visible to their owner" on public.memory_assets;
create policy "Memory assets are visible to their owner"
on public.memory_assets for select
using (
  owner_id = auth.uid()
  and exists (
    select 1 from public.memories
    where memories.id = memory_assets.memory_id
    and memories.owner_id = auth.uid()
  )
);

drop policy if exists "Memory assets are inserted by their owner" on public.memory_assets;
create policy "Memory assets are inserted by their owner"
on public.memory_assets for insert
with check (
  owner_id = auth.uid()
  and storage_bucket = 'memory-photos'
  and exists (
    select 1 from public.pets
    where pets.id = memory_assets.pet_id
    and pets.owner_id = auth.uid()
  )
  and exists (
    select 1 from public.memories
    where memories.id = memory_assets.memory_id
    and memories.owner_id = auth.uid()
    and memories.pet_id = memory_assets.pet_id
  )
);

drop policy if exists "Memory assets are updated by their owner" on public.memory_assets;
create policy "Memory assets are updated by their owner"
on public.memory_assets for update
using (
  owner_id = auth.uid()
  and exists (
    select 1 from public.memories
    where memories.id = memory_assets.memory_id
    and memories.owner_id = auth.uid()
  )
)
with check (
  owner_id = auth.uid()
  and storage_bucket = 'memory-photos'
  and exists (
    select 1 from public.pets
    where pets.id = memory_assets.pet_id
    and pets.owner_id = auth.uid()
  )
  and exists (
    select 1 from public.memories
    where memories.id = memory_assets.memory_id
    and memories.owner_id = auth.uid()
    and memories.pet_id = memory_assets.pet_id
  )
);

drop policy if exists "Memory assets are deleted by their owner" on public.memory_assets;
create policy "Memory assets are deleted by their owner"
on public.memory_assets for delete
using (
  owner_id = auth.uid()
  and exists (
    select 1 from public.memories
    where memories.id = memory_assets.memory_id
    and memories.owner_id = auth.uid()
  )
);

grant select, insert, update, delete
on table public.memory_assets
to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'memory-photos',
  'memory-photos',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Memory photos are visible to their owner" on storage.objects;
create policy "Memory photos are visible to their owner"
on storage.objects for select
using (
  bucket_id = 'memory-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Memory photos are inserted by their owner" on storage.objects;
create policy "Memory photos are inserted by their owner"
on storage.objects for insert
with check (
  bucket_id = 'memory-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Memory photos are updated by their owner" on storage.objects;
create policy "Memory photos are updated by their owner"
on storage.objects for update
using (
  bucket_id = 'memory-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'memory-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Memory photos are deleted by their owner" on storage.objects;
create policy "Memory photos are deleted by their owner"
on storage.objects for delete
using (
  bucket_id = 'memory-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);
