# deployment

## targets

| env | host | DB | URL |
|---|---|---|---|
| local dev | localhost:3000 | Neon dev branch | http://localhost:3000 |
| preview | Vercel preview | Neon preview branch (per-PR) | auto: `https://mini-mint-<sha>.vercel.app` |
| production | Vercel | Neon `main` branch | TBD |

## one-time setup

1. Create Vercel project, link to GitHub repo
2. Create Neon project `mini-mint`
3. Set Vercel env vars (Production + Preview):
   - `DATABASE_URL` — from Neon
   - `APP_PASSWORD_HASH` — bcrypt of your chosen password
   - `SESSION_SECRET` — `openssl rand -hex 64`
   - `FINNHUB_API_KEY` — from finnhub.io
   - `SECRETS_KEY` — `openssl rand -hex 32` (optional; encrypts finnhub key in DB)
4. Configure Vercel build:
   - install: `pnpm install --frozen-lockfile`
   - build: `pnpm db:migrate && pnpm build`
   - install command must use pnpm (set in Project Settings)
5. Set Vercel-Neon integration (auto-creates a Neon branch per PR)

## per-deploy

- pushes to non-main branches → Vercel preview build with auto-provisioned Neon branch
- merge to main → production build + migrations run against main Neon branch
- migrations are forward-only; never edit a migration that has been deployed (write a new one)

## smoke check

After deploy:
```bash
curl https://<deploy>/api/health
# expect: { ok: true, db: { configured: true, reachable: true }, ... }
```

## rollback

- Vercel: previous deployment is one click away in dashboard
- DB: Neon PITR (up to 7 days free; longer on paid). If a migration broke prod, restore the Neon branch to a point before the migration, then deploy a forward fix.

## secrets rotation

- Operator password: `pnpm seed:operator` (sprint 1 script) regenerates bcrypt + updates `app_settings.operator_password_hash`
- `SESSION_SECRET`: bump `kid` in `app_settings.session_secret_kid`; old cookies invalidated; users re-login
- Finnhub key: set new env var, redeploy; old key remains in DB column (re-encrypted) until next refresh cycle

## monitoring (sprint 3+)

- Vercel built-in: response times + error rate
- Sentry (later): client + server errors with stack
- Neon: query time + connection count in dashboard
- Uptime: GitHub Action ping `/api/health` every 5 min, post to Slack/email if down
