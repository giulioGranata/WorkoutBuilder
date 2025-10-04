# Workout Generator

Generatore di workout indoor strutturati, in stile Zwift.  
Input: FTP, durata, tipologia di workout.  
Output: steps dettagliati, chart interattivo, esportazione nei principali formati.

## ✨ Features
- Generazione workout basata su FTP e durata.
- Bias dinamico (75–125%).
- Pattern statici randomizzati per ogni tipologia:
  recovery, endurance, tempo, threshold, vo2max, anaerobic.
- Step `steady` e `ramp` (warm-up/cool-down ramp).
- Esportazione in **JSON**, **TXT**, **ZWO (Zwift)**.
- Visualizzazione grafica a zone (colori stile Zwift).
- Responsive, mobile-first.
- Test automatizzati con Vitest e Playwright.

## 🚀 Tech Stack
- Next.js 15 (App Router) + React + TypeScript
- TailwindCSS + shadcn/ui
- Vitest + Playwright
- Vercel (hosting)

## 📦 Installazione
```bash
npm install
npm run dev
```

## 🔐 Supabase authentication
1. In the Supabase dashboard open **Authentication → Providers → Email** and enable **Magic Link (Email OTP)**. Set the **Site URL** to your Vercel preview/production domain so the verification links redirect back to your app.
2. In Vercel go to **Settings → Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   Use the values from your Supabase project settings and redeploy so the runtime picks up the credentials.
3. To test locally, run `npm run dev`, visit `/sign-in`, request a magic link, and open it on the same device. After signing in you should be able to access `/pro`; when signed out you will be redirected back to `/sign-in`.

## 🗂️ Pattern catalog
- The default workout library lives in `public/patterns/default.json`. Update this file when you add or adjust pattern variants and bump the `version` string so clients know which dataset they are using. A copy is served at `public/patterns/patterns.json` for the runtime fetch.
- Every payload is validated at runtime with Zod. Invalid data (unknown workout types, missing fields, negative durations, incorrect ramp bounds, etc.) triggers an automatic fallback to the internal `FALLBACK_PATTERNS` catalog.
- When the remote fetch fails or the payload is invalid the UI keeps working with the fallback dataset and shows a warning toast so contributors notice the problem.
- Keep inline comments in English across the repository.
