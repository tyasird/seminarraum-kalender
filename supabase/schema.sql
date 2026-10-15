-- Run this in the Supabase SQL editor after enabling Email auth.
create extension if not exists btree_gist;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 80),
  note text check (char_length(coalesce(note, '')) <= 500),
  owner_id uuid not null references auth.users(id) on delete cascade,
  owner_name text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (extract(isodow from starts_at at time zone 'Europe/Berlin') between 1 and 5),
  check ((starts_at at time zone 'Europe/Berlin')::time >= time '08:00'),
  check ((ends_at at time zone 'Europe/Berlin')::time <= time '18:00'),
  check (extract(minute from starts_at at time zone 'Europe/Berlin') = 0),
  check (extract(minute from ends_at at time zone 'Europe/Berlin') = 0)
);

alter table public.bookings
  add constraint bookings_no_overlap
  exclude using gist (tstzrange(starts_at, ends_at, '[)') with &&);

alter table public.bookings enable row level security;

create policy "Authenticated institute members can view bookings"
on public.bookings for select
to authenticated
using (
  lower(auth.jwt() ->> 'email') like '%@ukbonn.de'
  or lower(auth.jwt() ->> 'email') like '%@uni-bonn.de'
);

create policy "Members create only their own bookings"
on public.bookings for insert
to authenticated
with check (
  auth.uid() = owner_id
  and (
    lower(auth.jwt() ->> 'email') like '%@ukbonn.de'
    or lower(auth.jwt() ->> 'email') like '%@uni-bonn.de'
  )
);

create policy "Owners update their bookings"
on public.bookings for update
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "Owners delete their bookings"
on public.bookings for delete
to authenticated
using (auth.uid() = owner_id);

create index if not exists bookings_starts_at_idx on public.bookings (starts_at);
