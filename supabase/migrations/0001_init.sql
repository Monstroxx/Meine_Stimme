-- Meine Stimme: Basis-Schema fuer Beschwerden, Staff-Zuordnung, Storage + RLS.
-- Siehe Umsetzungsplan Abschnitt 2 fuer die Begruendung der einzelnen Policies.

create extension if not exists "pgcrypto";

create table if not exists complaints (
  id uuid primary key default gen_random_uuid(),
  facility_slug text not null,
  problem_text text,
  problem_audio_path text,
  solution_text text,
  solution_audio_path text,
  is_anonymous boolean not null default true,
  name_text text,
  name_audio_path text,
  status text not null default 'offen' check (status in ('offen', 'in_bearbeitung', 'erledigt')),
  created_at timestamptz not null default now()
);

create index if not exists complaints_facility_slug_idx on complaints (facility_slug);

create table if not exists staff (
  user_id uuid primary key references auth.users (id) on delete cascade,
  -- null/'*' = Leitung, sieht alle Einrichtungen
  facility_slug text,
  role text not null default 'betreuer' check (role in ('betreuer', 'leitung'))
);

alter table complaints enable row level security;
alter table staff enable row level security;

-- Kiosk sendet ohne Login - Insert muss fuer "anon" offen sein. Bewusst, kein select/update/delete fuer anon.
create policy "anon kann beschwerden anlegen"
  on complaints for insert
  to anon
  with check (true);

create policy "staff sieht beschwerden der eigenen einrichtung"
  on complaints for select
  to authenticated
  using (
    exists (
      select 1 from staff
      where staff.user_id = auth.uid()
        and (staff.facility_slug is null or staff.facility_slug = complaints.facility_slug)
    )
  );

create policy "staff aendert status der eigenen einrichtung"
  on complaints for update
  to authenticated
  using (
    exists (
      select 1 from staff
      where staff.user_id = auth.uid()
        and (staff.facility_slug is null or staff.facility_slug = complaints.facility_slug)
    )
  );

create policy "staff sieht eigenen eintrag"
  on staff for select
  to authenticated
  using (user_id = auth.uid());

-- Privater Bucket: Audios werden ausschliesslich ueber die Serverless Functions (Service-Role-Key)
-- hoch- und herunterladen, siehe api/complaints.ts und api/audio-url.ts. Daher keine Storage-RLS
-- fuer "anon" oder "authenticated" noetig - der Service-Role-Key umgeht RLS ohnehin.
insert into storage.buckets (id, name, public)
values ('complaint-audio', 'complaint-audio', false)
on conflict (id) do nothing;
