-- YourTubeNext Supabase schema
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query).
-- Then enable Email auth (Authentication → Providers → Email) and
-- create a public storage bucket named "uploads" (Storage → New bucket).

create table if not exists public.likes (
  user_id uuid not null references auth.users (id) on delete cascade,
  video_id text not null,
  value text not null check (value in ('like', 'dislike')),
  created_at timestamptz not null default now(),
  primary key (user_id, video_id)
);

create table if not exists public.subscriptions (
  user_id uuid not null references auth.users (id) on delete cascade,
  channel text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, channel)
);

create table if not exists public.comments (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  user_name text not null default 'Someone',
  video_id text not null,
  text text not null check (char_length(text) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists comments_video_idx on public.comments (video_id, created_at desc);

-- Row Level Security: users can only read/write their own likes/subs;
-- comments are readable by everyone, writable by the author.
alter table public.likes enable row level security;
alter table public.subscriptions enable row level security;
alter table public.comments enable row level security;

drop policy if exists "own likes" on public.likes;
create policy "own likes" on public.likes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own subs" on public.subscriptions;
create policy "own subs" on public.subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "read comments" on public.comments;
create policy "read comments" on public.comments
  for select using (true);

drop policy if exists "write own comments" on public.comments;
create policy "write own comments" on public.comments
  for insert with check (auth.uid() = user_id);

drop policy if exists "delete own comments" on public.comments;
create policy "delete own comments" on public.comments
  for delete using (auth.uid() = user_id);

-- Storage bucket for future video/thumbnail uploads (public read):
-- insert into storage.buckets (id, name, public) values ('uploads', 'uploads', true);
-- Then add a storage policy allowing authenticated uploads + public reads.
