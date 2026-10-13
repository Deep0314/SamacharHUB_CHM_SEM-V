# SamacharHUB — Hindi Language Integration Update

This package contains all files modified to add full Hindi (`hi`) language support across SamacharHUB alongside English and Marathi.

## What's included:
- Full Hindi support in API Client Schemas (`lib/api-client-react`)
- MongoDB Models, Validation Middleware, Routes, and Multilingual Seed (`artifacts/api-server`)
- Frontend Language Context, Header, News Ticker, Cards, Footer, Hotspot Editor (`artifacts/enewspaper`)
- Public Pages: Home, Articles, Categories, Editions, About Us, Contact Us (`artifacts/enewspaper`)
- Admin CMS Forms: Article Form, Categories, Breaking News, Edition Form, Site Settings, General Settings, Hotspot UI (`artifacts/enewspaper`)
- Complete Multilingual Database Seeding for Categories, Articles, Breaking News, Site Settings, and Sample Edition

## How to Apply:

### Option 1: Extract Zip Directly
Extract this zip file directly into your repository root (`SamacharHUB/`). All files are organized by their original relative folder paths.

### Option 2: Using Git Apply (if git patch is preferred)
If using the included `hindi-language-update.patch`, run:
```bash
git apply hindi-language-update.patch
```

## After applying:
1. Re-seed MongoDB with multilingual data:
```bash
pnpm seed
```
2. Build / run:
```bash
pnpm --filter @samacharhub/api-server build
pnpm run dev:api
pnpm run dev:frontend
```
