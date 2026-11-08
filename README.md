# My Near Shops — Nuxt 3 SSR + Firebase

A Nuxt 3 server-side rendered web app for discovering nearby local shops and products. Built with Vue 3, Pinia, Firebase Auth/Firestore, and Google Maps.

## Features

- **SSR landing page** with `useHead` SEO meta tags
- **Pink theme** inspired by the ecommerce-web reference
- **Find Shops / Find Items** live map search with geolocation and radius filter
- **Firestore schema** for users, roles, shops, and products

## Tech Stack

- [Nuxt 3](https://nuxt.com)
- [Vue 3](https://vuejs.org)
- [Pinia](https://pinia.vuejs.org)
- [Firebase JS SDK](https://firebase.google.com)
- [vue3-google-map](https://github.com/inocanfly/vue3-google-map)

## Setup

1. Copy the environment example and fill in your Firebase/Google Maps credentials:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
npm install
```

3. Run the dev server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
npm run preview
```

## Android App

The Android app uses Capacitor and the application ID `com.mynearshops.app`. The normal web build remains SSR; Android builds use a client-side static Nuxt bundle.

Prerequisites:

- Android Studio with the Android SDK installed
- A compatible JDK configured in Android Studio
- An emulator or Android device with USB debugging enabled

Generate the Nuxt bundle and synchronize it with the native project:

```bash
npm run android:sync
```

Open the project in Android Studio, then select a device and run the `app` configuration:

```bash
npm run android:open
```

After changing Vue, Nuxt, or web assets, run `npm run android:sync` again before rebuilding the Android app. `npm run android:run` performs the sync and launches through the Capacitor CLI when the Android SDK tools are available on `PATH`.

For Android builds, set `NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN` to the Firebase-hosted domain (for example, `<project-id>.firebaseapp.com`) because the packaged app cannot use this repository's Nuxt server proxy routes. Add the relevant domain in Firebase Authentication settings and configure the Google Maps API key for Android/WebView use.

## Environment Variables

| Variable | Description |
| --- | --- |
| `NUXT_SMTP_HOST` | SMTP server hostname for inquiry emails |
| `NUXT_SMTP_PORT` | SMTP port, typically `587` or `465` |
| `NUXT_SMTP_USER` | SMTP account username |
| `NUXT_SMTP_PASS` | SMTP account password or provider-issued app password |
| `NUXT_INQUIRY_TO` | Address that receives inquiry emails |
| `NUXT_INQUIRY_FROM` | Sender address authorized by the SMTP provider; defaults to the SMTP username |
| `NUXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API key |
| `NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Production auth domain. Use `mynearshops.com`, whose `/__/auth/*` routes proxy to Firebase Hosting |
| `NUXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket |
| `NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NUXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Optional Firebase Analytics ID |
| `NUXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps JavaScript API key |
| `NUXT_PUBLIC_GOOGLE_MAPS_ID` | Optional cloud map ID |

The inquiry form requires an SMTP provider. Set the server-side `NUXT_SMTP_*`
and `NUXT_INQUIRY_*` values in the production hosting environment and restart
or redeploy the app. Use the hosting provider's secret management for the SMTP
password; do not commit credentials or put them in `NUXT_PUBLIC_*` variables.
For local development, set these values in `.env` and restart the dev server.
The older unprefixed `SMTP_*` and `INQUIRY_*` values are read while Nuxt loads
its configuration, but the `NUXT_*` names also work as runtime overrides.

## Project Structure

```text
mynearshops/
├── assets/css/global.css    # Global styles + pink palette variables
├── components/              # (add reusable components here)
├── composables/             # useFirebase helper
├── layouts/
│   ├── default.vue          # Site header + footer
│   └── dashboard.vue        # Dashboard sidebar layout
├── pages/
│   ├── index.vue            # Landing page (SSR)
│   ├── find-shops.vue       # Map shop search
│   ├── find-items.vue       # Map item search
├── plugins/
│   └── firebase.client.ts   # Firebase app/auth/db init
├── server/                  # Nuxt server routes (future API)
├── types/
│   └── index.ts             # Shared TypeScript interfaces
├── nuxt.config.ts
└── SCHEMA.md                # Firestore data model
```

## Pages

- `/` — Landing page with hero, stats, features, and CTA
- `/pages/index.vue` — Redirects to the landing page at `/`
- `/find-shops` — Search nearby shops by location/name on Google Maps
- `/find-items` — Search nearby products on Google Maps

## Notes

- The map pages render client-only inside `<ClientOnly>` to avoid SSR issues with the Google Maps JS API.
- `useHead` is used on every public page for SEO.
- Add every production app hostname to Firebase Console > Authentication > Settings > Authorized domains. The server routes under `server/routes/__/` proxy Firebase's reserved auth helpers, allowing `NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=mynearshops.com` in production.

## License

Private — for My Near Shops.
