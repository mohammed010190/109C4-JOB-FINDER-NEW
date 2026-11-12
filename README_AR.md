# 109C4 JOB FINDER — Bilingual V2

## Contents
- `index.html` — page structure and Arabic/English controls
- `styles.css` — responsive design
- `app.js` — language switching, job search, filters, saved jobs
- `manifest.webmanifest` — installable web app metadata

## Publish on GitHub Pages
Upload the **contents** of this folder to the root of the repository (not the enclosing folder).
In Settings → Pages choose `Deploy from a branch`, branch `main`, folder `/(root)`.

## Search data source
This version uses the public Dev Global Jobs endpoint:
`GET https://devglobaljobs.com/api/v1/jobs`
Supported documented query parameters include `limit`, `offset`, `category`, `country`, `search`, `easyApply`, and `featured`.
No API key is required. Respect the source rate limit and terms. Keep the visible “Powered by Dev Global Jobs” attribution and each job's original listing link.

## Important limitations
- A source may return no jobs for a particular keyword/country; the app must show that honestly.
- Posting date and email are shown only when included in the source record; the app does not invent them.
- Region and city filters are applied to the location text returned by the source, so listings with missing or differently formatted locations may not match.
- Saved jobs and selected language are stored in this browser/device only. This version does not yet include accounts or cloud sync.
- The API terms state free use is for internal, research and non-commercial use; commercial redistribution requires written permission.
