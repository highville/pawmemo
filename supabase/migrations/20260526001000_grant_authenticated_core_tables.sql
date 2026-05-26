grant usage on schema public to authenticated;

grant select, insert, update, delete
on table public.profiles
to authenticated;

grant select, insert, update, delete
on table public.pets
to authenticated;

grant select, insert, update, delete
on table public.memories
to authenticated;

grant select, insert, update, delete
on table public.tags
to authenticated;

grant select, insert, update, delete
on table public.memory_tags
to authenticated;

grant select, insert, update, delete
on table public.care_signals
to authenticated;
