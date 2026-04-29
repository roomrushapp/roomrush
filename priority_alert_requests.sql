-- Run this in the Supabase SQL editor to create the priority_alert_requests table.

create table if not exists public.priority_alert_requests (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  email                 text,
  whatsapp              text,
  max_budget            integer,
  move_in_date          date,
  minimum_stay          text,
  preferred_areas       text,
  open_to_nearby_cities boolean not null default false,
  room_type             text,
  kvr_needed            text,
  notes                 text,
  terms_accepted        boolean not null default false,
  status                text not null default 'pending',
  paid                  boolean not null default false,
  start_date            timestamptz,
  end_date              timestamptz,
  extension_used        boolean not null default false,
  created_at            timestamptz not null default now()
);

-- Allow anonymous users to insert their own requests.
-- No public reads — only admins (via service role) can read the table.
alter table public.priority_alert_requests enable row level security;

create policy "Anyone can submit a priority alert request"
  on public.priority_alert_requests
  for insert
  to anon, authenticated
  with check (true);

-- Admin reads via service role bypass RLS automatically.
-- No select policy needed for public users.
