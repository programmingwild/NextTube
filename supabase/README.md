# Supabase setup (optional — the app works offline without it)

The app runs 100% locally with `localStorage` + IndexedDB out of the box.
Add Supabase to get real accounts + cloud likes / subscriptions / comments
that follow you across devices.

1. Create a free project at https://supabase.com (takes ~2 min).
2. In the dashboard, open **SQL → New query**, paste `supabase/schema.sql`
   from this repo, and run it.
3. Enable email login: **Authentication → Providers → Email → on**.
4. Copy your keys: **Project Settings → API**
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Add them to `.env.local` (see `.env.example`) and restart:
   `npm run dev`
6. Click the avatar → sign up with any email + password → done.
   Likes, subs and comments now sync to the cloud. Signed-out visitors
   keep using local storage.

To go back offline, just remove the two env vars and restart.
