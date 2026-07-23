# My Near Shops — Nuxt 3 SSR + Firebase

A Nuxt 3 server-side rendered web app for discovering nearby local shops and products. Built with Vue 3, Pinia, Firebase Auth/Firestore, and Google Maps.

## Features

- **SSR landing page** with `useHead` SEO meta tags
- **Pink theme** inspired by the ecommerce-web reference
- **Find Shops / Find Items** live map search with geolocation and radius filter
- **Firebase Authentication** (email/password + Google sign-in)
- **Dashboard** shell with role-aware layout
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

## Environment Variables

| Variable | Description |
| --- | --- |
| `NUXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API key |
| `NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `NUXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket |
| `NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NUXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Optional Firebase Analytics ID |
| `NUXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps JavaScript API key |
| `NUXT_PUBLIC_GOOGLE_MAPS_ID` | Optional cloud map ID |

## Project Structure

```text
mynearshops/
├── assets/css/global.css    # Global styles + pink palette variables
├── components/              # (add reusable components here)
├── composables/             # useFirebase helper
├── layouts/
│   ├── default.vue          # Site header + footer
│   └── dashboard.vue        # Dashboard sidebar layout
├── middleware/
│   └── auth.ts              # Client-side auth guard
├── pages/
│   ├── index.vue            # Landing page (SSR)
│   ├── find-shops.vue       # Map shop search
│   ├── find-items.vue       # Map item search
│   ├── login.vue            # Email/password + Google login
│   └── dashboard.vue        # Dashboard home
├── plugins/
│   └── firebase.client.ts   # Firebase app/auth/db init
├── server/                  # Nuxt server routes (future API)
├── stores/
│   └── auth.ts              # Pinia auth store
├── types/
│   └── index.ts             # Shared TypeScript interfaces
├── nuxt.config.ts
└── SCHEMA.md                # Firestore data model
```

## Pages

- `/` — Landing page with hero, stats, features, and CTA
- `/find-shops` — Search nearby shops by location/name on Google Maps
- `/find-items` — Search nearby products on Google Maps
- `/login` — Authenticate with email/password or Google
- `/dashboard` — Protected dashboard with quick stats

## Notes

- The map pages render client-only inside `<ClientOnly>` to avoid SSR issues with the Google Maps JS API.
- The dashboard route uses a client-only auth middleware because Firebase session restoration happens in the browser.
- `useHead` is used on every public page for SEO.

## License

Private — for My Near Shops.
