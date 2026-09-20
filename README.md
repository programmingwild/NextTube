# NextTube – YouTube Clone

A YouTube clone built with Next.js 15 (App Router). Migrated from the
CRA-based `yourtubeclone` and rebuilt with a faithful youtube.com UI.

## Features

- Home feed with category chips + Shorts shelf
- Watch pages: likes, subscriptions, comments, views, Save/Watch-Later,
  playlists, theater mode, autoplay-next, keyboard shortcuts
- Search with suggestions + results page
- Library: History, Liked, Watch Later, Playlists, Subscriptions
- Channel pages, Creator Studio (URL + real file uploads via IndexedDB)
- Recommendations ranked from your local watch activity
- Dark mode, PWA manifest, Razorpay premium (test key)
- Optional Supabase cloud (auth + synced likes/subs/comments) — see
  `supabase/README.md`. Without keys the app runs fully offline.

## Run locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

Production check:

```bash
npm run build
npm run start
```

## Deploy (Vercel)

1. Push this folder to a GitHub repo.
2. Import it in https://vercel.com (Framework: Next.js).
3. Add env vars: `NEXT_PUBLIC_RAZORPAY_KEY` (and Supabase keys if used).
4. Deploy. No build config needed (`npm run build` is the default).

## Env vars

See `.env.example`. Only `NEXT_PUBLIC_*` vars are needed; nothing secret
is required for the offline build.
