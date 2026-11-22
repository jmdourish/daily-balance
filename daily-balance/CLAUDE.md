# Daily Balance

A personal wellbeing tracker, used on an Android phone as an installed web app (PWA).
The owner is a beginner (has done an intro to Python), so explain changes simply and keep code easy to read.

## Tech
- Plain HTML, CSS and JavaScript. No framework, no build step, no dependencies.
- Data lives in the phone's localStorage (key `dailybalance.v1`). No backend, no accounts.
- Files: index.html, style.css, app.js, manifest.webmanifest, sw.js (offline cache).

## Working rules
- Propose a plan and wait for approval before editing files.
- One small feature at a time; say how to test it on the phone.
- Do not add dependencies or a framework without asking.
- When any file changes, bump `CACHE` in sw.js so the phone picks up the update.
- Never delete or reshape saved data without a migration (the user's history matters).

## Done so far (v1)
- Today view: mantra, water counter, 6 habit toggles with streaks, journal with daily prompt
- Week view (7-day dots), Journal history

## Next up (in order)
1. Deploy online (needed for install on phone)
2. Weight and study-time logging (numbers)
3. Skin photos (camera input, stored in IndexedDB, not localStorage)
4. Charts for weight / study time
5. Export/backup of data to a file
6. Reminders (note: limited on web apps; discuss options)
