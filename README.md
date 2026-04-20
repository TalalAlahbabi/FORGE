# FORGE — Your Personal Trainer App

A browser-based gym tracker with AI coaching, adaptive workouts, and full training analytics.  
Installable as a Progressive Web App (PWA) on iPhone, Android, and desktop.

## 🚀 Quick Start

### Option A: Try it locally (no install)

1. Download all files to a folder
2. Open `index.html` in your browser
3. That's it

Note: PWA install and service worker only work when served over HTTPS. Local file:// works for development but install prompts and offline mode will not activate.

### Option B: Deploy to GitHub Pages (recommended)

1. Push these files to your GitHub Pages repo (e.g. `Workout-Plan`)
2. Go to **Settings → Pages** on GitHub
3. Set source: **Deploy from a branch → main → / (root)**
4. Wait 1-2 minutes for deployment
5. Visit `https://YOUR-USERNAME.github.io/Workout-Plan/`
6. On your phone: open that URL → Share → **Add to Home Screen**

## 📁 File Structure

```
/
├── index.html              ← main app
├── style.css               ← all styles
├── script.js               ← all logic
├── manifest.json           ← PWA install metadata
├── service-worker.js       ← offline caching
├── favicon.ico             ← browser tab icon
├── icons/                  ← app icons (all sizes)
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-maskable-192.png
│   ├── icon-maskable-512.png
│   ├── apple-touch-icon.png
│   ├── icon-32.png
│   └── icon-16.png
└── README.md               ← this file
```

**All files must be in the same directory.** The service worker uses relative paths so it works under any subpath (e.g. `/Workout-Plan/`).

## 📱 Installing on Your Phone

### iPhone / iPad (Safari only)
1. Open your site in **Safari** (not Chrome — Chrome on iOS can't install PWAs)
2. Tap the **Share** button (square with arrow up)
3. Scroll down → tap **Add to Home Screen**
4. Tap **Add**
5. FORGE icon appears on your home screen — tap to open full-screen

### Android (Chrome)
1. Open your site in Chrome
2. You'll see an **"Install FORGE"** banner at the bottom after ~15 seconds
3. Tap **Install**
4. Or: Menu (⋮) → **Install app**

### Desktop (Chrome, Edge)
1. Look for the **install icon** in the address bar (⊕ or computer with down arrow)
2. Click it → **Install**
3. FORGE opens as a standalone app window

## ✨ What Works Offline

Once installed, these work with no internet:
- Logging workouts, viewing history, records, analytics
- Dashboard, calendar, plans, exercise library
- Local AI coach (pattern-based intelligence using your data)
- Measurements, progress photos, nutrition, goals, badges, profile

These need internet:
- YouTube exercise demo videos (in exercise detail modal)
- Real Claude/Gemini AI coach (if/when enabled)

## 🔄 Updating the App

When you push new code to GitHub Pages:
1. Installed users will see an **"A new version of FORGE is available"** banner at the top
2. They tap **Refresh** → the new version takes over
3. Their data is preserved (localStorage survives updates)

If you change anything, **bump the version** in `service-worker.js`:
```js
const CACHE_VERSION = "forge-v1.0.1"  // increment this
```

Without bumping the version, users may get stale cached files.

## 💾 Where User Data Lives

Everything is stored in the browser's **localStorage** on the user's device:
- `forge_workouts` — all logged sessions
- `forge_profile` — user profile
- `forge_measurements` — body measurements
- `forge_photos` — progress photos (base64)
- `forge_foodLog` — nutrition log
- `forge_goals` — goals
- `forge_badges` — earned badges
- `forge_coachChat` — AI coach conversation history

**Important:** This data is per-device and per-browser. It doesn't sync between phone and laptop. Users can export/import via **Profile → Export All Data** for backups.

## 🐛 Troubleshooting

**"Add to Home Screen" doesn't appear on iPhone**
- Must use Safari, not Chrome/Firefox on iOS
- URL must be HTTPS (GitHub Pages is HTTPS ✓)
- Check the manifest link is valid by visiting `/manifest.json`

**Install banner doesn't show on Android**
- It only appears if: site is HTTPS, manifest is valid, service worker is registered, user has engaged with the site for ~30 seconds
- Or manually: Chrome menu → "Install app"

**Service worker not caching**
- Hard refresh (Cmd/Ctrl+Shift+R) after first visit
- Check DevTools → Application → Service Workers — should show "activated"
- Clear all caches if stuck: DevTools → Application → Clear storage

**App looks broken after update**
- User may have an old cached version. Have them: iOS: long-press icon → Delete → re-add. Android: Settings → Apps → FORGE → Clear data → re-install.

## 📜 License

Your code, do whatever you want with it.
