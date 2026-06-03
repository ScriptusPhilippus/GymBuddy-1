# GymBuddy

A dark, mobile-first workout tracker — routines, a live set logger, a 100+ exercise reference with muscle targeting, and progress analytics. Runs as an installable PWA and ships to Android via Capacitor.

**Privacy:** GymBuddy is fully client-side. All data (routines, history, PRs, bodyweight, settings) is stored locally in your browser via `localStorage`. There is no backend, no account, and nothing is sent to a server. Use **Settings → Advanced → Export data** to back up.

## Tech stack

- Vite 6 + React 19 + TypeScript
- Tailwind CSS v4
- Capacitor 8 (Android)
- PWA (service worker + web manifest)

## Run locally

**Prerequisites:** Node.js 18+

```bash
npm install
npm run dev        # http://localhost:3000
```

## Build

```bash
npm run lint       # tsc --noEmit (type check)
npm run build      # production build -> dist/
npm run preview    # preview the production build
```

## Deploy (Netlify)

The repo ships a `netlify.toml` with the build command, publish directory, an SPA fallback, and baseline security headers.

- Build command: `npm run build`
- Publish directory: `dist`

Push to the connected GitHub repo and Netlify builds automatically, or run a manual deploy with the Netlify CLI (see below).

## Ship as an Android app (Capacitor)

```bash
npm run build
npx cap add android        # first time only
npx cap sync               # copy web build into the native project
npx cap open android       # open in Android Studio to build the APK/AAB
```

App id: `com.mitsi.gymbuddy` (see `capacitor.config.ts`).
