# Camp Fire 🔥

A Progressive Web App for camp participants to maintain a daily check-in streak. Built with React + TypeScript + Firebase + Tailwind CSS v4.

## Architecture decisions

| Decision | Choice | Reason |
|---|---|---|
| Auth | Firebase Anonymous | Zero friction for teens; no email/password required |
| State | React Context + useReducer | Lightweight; no Redux overhead for this scale |
| QR scanning | html5-qrcode | Mature, camera-API based, no native app required |
| Styling | Tailwind CSS v4 | Zero-config, design tokens via `@theme` block |
| PWA | vite-plugin-pwa + Workbox | Auto service worker, offline caching |
| Admin auth | Env-secret gate | Simple enough for a 1-week camp; upgrade to Firebase Admin SDK for multi-camp use |

---

## Quick Start

### 1. Clone & install

```bash
git clone <your-repo>
cd camp-fire
npm install
```

### 2. Firebase setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project (e.g. `camp-fire-2024`)
3. Enable **Firestore Database** (start in production mode)
4. Enable **Authentication → Anonymous** sign-in
5. Copy your web app config from **Project Settings → Your apps**

### 3. Environment variables

```bash
cp .env.example .env
```

Fill in `.env`:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=camp-fire-2024.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=camp-fire-2024
VITE_FIREBASE_STORAGE_BUCKET=camp-fire-2024.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234:web:abc123
VITE_CAMP_START_DATE=2024-07-01   # First day of camp (YYYY-MM-DD)
VITE_CAMP_TOTAL_DAYS=7
VITE_ADMIN_SECRET=choose_a_strong_secret
```

### 4. Run dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 5. Seed camp days to Firestore

1. Open the app → log in → navigate to `/admin`
2. Enter admin secret (from `.env`)
3. Click **"Seed defaults"** — this writes the 7 default days to Firestore

You can then edit each day's verse, challenge, and theme from the Admin panel.

---

## Build & Deploy

### Build

```bash
npm run build
```

Output: `dist/`

### Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase use --add   # select your project
firebase deploy
```

Or deploy only hosting:

```bash
firebase deploy --only hosting
```

### Deploy Firestore rules

```bash
firebase deploy --only firestore:rules
```

---

## QR Code workflow

Each day has a unique check-in URL: `https://your-app.web.app/checkin/day-1`

To generate printable QR codes:

1. Open Admin panel → **QR Codes** tab
2. Click **"QR →"** on any day to see the QR code
3. Screenshot and print, or right-click the QR image to save
4. Hide the printed QR code somewhere on the camp grounds for participants to find

The QR codes are generated via `api.qrserver.com` — no API key needed.

---

## Project structure

```
src/
├── components/
│   ├── layout/
│   │   └── AppShell.tsx          # Bottom nav + header
│   └── ui/
│       ├── index.tsx              # Button, Card, DayDot, BadgeChip, SectionTitle
│       └── SplashScreen.tsx
├── features/
│   ├── auth/
│   │   └── OnboardingPage.tsx    # Nickname + team selection
│   ├── badges/
│   │   ├── badgeLogic.ts         # Badge unlock computation
│   │   └── BadgesPage.tsx
│   ├── dashboard/
│   │   └── DashboardPage.tsx     # Main home screen
│   ├── qr/
│   │   ├── QRScanPage.tsx        # Camera scanner
│   │   └── CheckInResultPage.tsx # Post-scan result + verse
│   ├── streak/
│   │   └── streakUtils.ts        # Streak / day availability logic
│   ├── verses/
│   │   └── defaultDays.ts        # 7-day content config
│   └── admin/
│       └── AdminPage.tsx         # Day editor + QR generator + participants
├── services/
│   ├── firebase.ts               # App init
│   ├── authService.ts            # Anonymous auth + user profiles
│   ├── checkInService.ts         # Check-in CRUD
│   └── daysService.ts            # Day config CRUD
├── store/
│   └── AppContext.tsx             # Global state via Context + useReducer
├── types/
│   └── index.ts                  # All TypeScript types
└── styles/
    └── globals.css               # Tailwind v4 + design tokens
```

---

## Customization

### Adding more teams

Edit `TEAMS` array in `src/features/auth/OnboardingPage.tsx`.

### Editing day content

Either:
- Edit `src/features/verses/defaultDays.ts` and re-seed, or
- Use the Admin panel → Days → Edit

### Adding badges

1. Add a new `BadgeId` to `src/types/index.ts`
2. Add definition to `BADGE_DEFINITIONS` in `src/features/badges/badgeLogic.ts`
3. Add unlock condition in `computeBadges()`

### Changing camp dates

Update `VITE_CAMP_START_DATE` in `.env` and re-seed days.

---

## Scaling to multiple camp editions

- Use separate Firebase projects per edition (cheap, total isolation)
- Or add a `campId` field to all Firestore documents and filter by it
- The admin panel can be extended with Firebase Admin SDK for server-side operations

---

## Known limitations

- Admin panel uses an env-var secret (not Firebase Auth roles). Suitable for a week-long camp. For production, implement proper Firebase custom claims.
- QR codes are displayed via a public API (`api.qrserver.com`). For offline-first QR generation, install `qrcode` npm package and generate client-side.
- Participant names in Admin panel show Firebase UIDs (anonymous auth has no display name). Cross-reference with the `users` Firestore collection to see nicknames.
