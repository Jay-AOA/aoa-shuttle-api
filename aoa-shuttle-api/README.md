# AOA Shuttle API (Vercel + Supabase + Expo Push)

Minimal serverless API to accept shuttle requests from your Expo app, let drivers set ETAs,
and push notifications back to customers. Deploys on **Vercel**.

## Endpoints
- `POST /api/shuttle-requests` — create a request
- `GET  /api/driver/requests` — list requests (requires `Authorization: Bearer <AUTH_TOKEN>`)
- `POST /api/requests/:id/eta` — set ETA + push notify (requires auth)
- `POST /api/requests/:id/status` — update status + push notify (requires auth)

## Environment Variables (Vercel → Project Settings → Environment Variables)
- `SUPABASE_URL` — from Supabase project settings
- `SUPABASE_SERVICE_ROLE` — **service role key** (server only!)
- `AUTH_TOKEN` — any long random string you choose (for driver endpoints)

## Local dev (optional)
You can test locally with `vercel dev` if you have the Vercel CLI installed.
