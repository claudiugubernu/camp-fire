# Camp Fire 🔥

A Progressive Web App for camp participants to maintain a daily check-in streak. Built with React + TypeScript + Firebase + Tailwind CSS v4.

## Architecture decisions

| Decision    | Choice                     | Reason                                                                            |
| ----------- | -------------------------- | --------------------------------------------------------------------------------- |
| Auth        | Firebase Anonymous         | Zero friction for teens; no email/password required                               |
| State       | React Context + useReducer | Lightweight; no Redux overhead for this scale                                     |
| QR scanning | @zxing/browser             | Custom camera UI, no third-party styling, back camera by default                  |
| Styling     | Tailwind CSS v4            | Zero-config, design tokens via `@theme` block                                     |
| PWA         | vite-plugin-pwa + Workbox  | Auto service worker, offline caching                                              |
| Admin auth  | Env-secret gate            | Simple enough for a 1-week camp; upgrade to Firebase Admin SDK for multi-camp use |

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

1. Open the app → complete onboarding → navigate to `/admin`
2. Enter admin secret (from `.env`)
3. Click **"Seed defaults"** — this writes the 7 default days to Firestore

> ⚠️ Seed defaults overwrites existing days. Use it only for initial setup or to reset to defaults. Edit days afterwards from the Admin panel directly.

---

## Build & Deploy

### Build

```bash
npm run build
```

Output: `dist/`

### Deploy to Render

1. Push your repo to GitHub
2. Create a new **Static Site** on [render.com](https://render.com)
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add all `VITE_*` environment variables in Render dashboard
6. Under **Redirects/Rewrites**, add: `/* → /index.html` (Rewrite) for SPA routing

### Keep-alive (prevent Render free tier spin-down)

Set up a cron job at [cron-job.org](https://cron-job.org) to ping your app URL every 10 minutes.

### Deploy Firestore rules

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules,firestore:indexes
```

---

## QR Code workflow

Each day has a unique check-in URL: `https://your-app.onrender.com/checkin/day-1`

To generate printable QR codes:

1. Open Admin panel → **QR Codes** tab
2. Click **"QR →"** on any day to see the QR code
3. Screenshot and print, or right-click the QR image to save
4. Hide the printed QR code somewhere on the camp grounds each morning

The QR codes are generated via `api.qrserver.com` — no API key needed. QR links never change even if you edit day content.

---

## Project structure

```
src/
├── components/
│   ├── layout/
│   │   └── AppShell.tsx                  # Bottom nav + header
│   └── ui/
│       ├── index.tsx                      # Button, Card, DayDot, BadgeChip, SectionTitle
│       └── SplashScreen.tsx
├── features/
│   ├── auth/
│   │   └── OnboardingPage.tsx            # Nickname + team selection (2 steps)
│   ├── badges/
│   │   ├── badgeLogic.ts                 # Badge unlock computation
│   │   └── BadgesPage.tsx
│   ├── dashboard/
│   │   └── DashboardPage.tsx             # Main home screen + streak + progress
│   ├── qr/
│   │   ├── QRScanPage.tsx                # Camera scanner (@zxing/browser)
│   │   └── CheckInResultPage.tsx         # Post-scan result + verse + confetti
│   ├── streak/
│   │   └── streakUtils.ts                # Streak / day availability logic
│   ├── verses/
│   │   └── defaultDays.ts                # 7-day content config (verse + challenge)
│   ├── appreciations/
│   │   ├── AppreciationsPage.tsx         # Send appreciation form (5/day, 150 chars)
│   │   └── AppreciationsAdminView.tsx    # Admin view: leaderboard + all messages
│   └── admin/
│       └── AdminPage.tsx                 # Day editor + QR generator + participants + appreciations
├── services/
│   ├── firebase.ts                       # App init
│   ├── authService.ts                    # Anonymous auth + user profiles + nickname check
│   ├── checkInService.ts                 # Check-in CRUD
│   ├── daysService.ts                    # Day config CRUD + seed
│   └── appreciationService.ts           # Appreciations CRUD + daily limit check
├── store/
│   └── AppContext.tsx                    # Global state via Context + useReducer
├── types/
│   └── index.ts                          # All TypeScript types
└── styles/
    └── globals.css                       # Tailwind v4 + design tokens + animations
```

---

## Features

### Participant

- **Onboarding** — nickname (alphanumeric only, unique, case-insensitive) + team selection
- **Daily check-in** — QR code scan or direct URL, one per day, no retroactive check-ins
- **Streak system** — consecutive day tracking, resets on missed days
- **Daily content** — Bible verse + practical challenge unlocked after check-in
- **Badges** — 14 badges with various unlock conditions
- **Cutia Aprecierilor** — send up to 5 appreciations per day (150 chars each)
- **PWA** — installable on iOS and Android, works offline

### Admin (`/admin` + secret)

- Edit day content (theme, verse, challenge, unlock date)
- Generate and display QR codes for each day
- View all participants + check-in status
- View all appreciations + team leaderboard
- Seed default days to Firestore

---

## Badges (14 total)

| Badge                | Condition                                    |
| -------------------- | -------------------------------------------- |
| 🧭 Explorer          | First check-in                               |
| 🔥 Paznicul Flăcării | All 7 days completed                         |
| 🌅 Dimineața Devreme | Check-in before 9 AM                         |
| ⚡ Primii 15         | One of the first 15 participants to check in |
| 🔥 Pe Foc            | 3 consecutive days                           |
| 🏕️ La Jumătate       | 4 out of 7 days                              |
| 🕵️ Căutătorul Secret | Nickname contains "fire"                     |
| 👑 Căpitanul         | First in your team to check in on any day    |
| 🤝 Spirit de Echipă  | Entire team completed the same day           |
| 🏆 Echipa de Foc     | Your team has the most total check-ins       |
| 🏅 All-In            | All other badges unlocked                    |
| 💛 Inimă Caldă       | First appreciation sent                      |
| 🌟 Generos           | 10 appreciations sent                        |
| ❤️ Suflet Mare       | 15 appreciations sent                        |

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

### Resetting a participant's account

Participants can reset their own account from the Dashboard → "Schimbă contul" button. This clears localStorage and redirects to onboarding. Check-ins and appreciations in Firestore are preserved but no longer linked to the new anonymous session.

---

## Firestore collections

| Collection      | Description                                                       |
| --------------- | ----------------------------------------------------------------- |
| `users`         | Participant profiles (nickname, teamId, isAdmin)                  |
| `checkins`      | Daily check-ins (userId, dayId, completedAt, earlyBird)           |
| `days`          | Day config (verse, challenge, theme, unlockDate)                  |
| `appreciations` | Appreciation messages (fromUserId, fromNickname, teamId, message) |

---

## Scaling to multiple camp editions

- Use separate Firebase projects per edition (cheap, total isolation)
- Or add a `campId` field to all Firestore documents and filter by it
- The admin panel can be extended with Firebase Admin SDK for server-side operations

---

## Known limitations

- Admin panel uses an env-var secret (not Firebase Auth roles). Suitable for a week-long camp. For production, implement proper Firebase custom claims.
- QR codes are displayed via a public API (`api.qrserver.com`). For offline-first QR generation, install `qrcode` npm package and generate client-side.
- Resetting an account (Schimbă contul) does not delete the old anonymous user from Firebase Auth. These accumulate but are automatically cleaned up by Firebase after 30 days of inactivity.
